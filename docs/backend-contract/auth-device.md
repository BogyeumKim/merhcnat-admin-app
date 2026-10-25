# 서버 계약: 로그인 / 추가 인증 / 기기 등록 (MySQL, Spring Boot)

서버 제작 때 쓰는 계약이다. 이름/형식은 `conventions.md`를 따른다. 모든 값은 제안이다.

## 1. 인증 방식별 서버 동작

| 유저 `otp_type` | 인증 | 서버가 코드를 저장하나 |
| --- | --- | --- |
| `0` (TOTP) | **매 로그인마다**. 비밀키 + 현재 시각으로 서버가 검증 시점에 계산해 비교 | **저장하지 않는다.** 마지막 수락 스텝만 기록 |
| `1` (문자/메일/카카오) | **최초 1회(기기 등록·교체 시)만**. 같은 기기 재로그인은 ID/비밀번호만 | 랜덤 코드를 만들어 `auth_challenge`에 **해시**로 저장 |

### TOTP 검증 규칙 (여러 자료의 공통 내용, RFC 6238 원문은 이번에 확인하지 못함)
- 허용 창은 작게(현재 ±1 스텝). 시계 오차는 NTP로 해결하고 창을 넓히지 않는다.
- **재사용 방지:** 사용자별 `otp_last_accepted_step`을 저장하고 그 이하 스텝은 거부한다. 갱신은 원자적으로(`UPDATE … WHERE otp_last_accepted_step < ?`의 영향 행 수로 판정).
- 상수 시간 비교, 시도 횟수 제한.
- 비밀키는 가진 사람이 미래의 모든 코드를 만들 수 있다. **평문 저장을 피하고 애플리케이션 암호화(AES-GCM 등, 키는 KMS/Vault)를 권장**한다 (자료에 기준이 없는 일반 보안 판단).

### 문자/메일/카카오 흐름 검토: 말씀하신 흐름에서 보완할 점

흐름 자체(서버가 랜덤 코드 생성 → 새 테이블 저장 → 유저 테이블에 등록된 수단으로 발송 → 사용자가 입력 → DB 조회로 판정)는 맞다. 아래를 보완해야 한다. (1회용·짧은 유효시간·자동 입력·코드-세션 결합은 검색 자료 근거. 해시 저장, 횟수 제한, CSPRNG 등은 일반 보안 관행이며 이번 검색에서 직접 확인하지 못했다.)

1. **코드는 평문이 아니라 해시로 저장한다.** 6자리는 경우의 수가 100만뿐이라 단순 SHA-256은 DB가 유출되면 바로 풀린다 → **서버 비밀키를 쓴 HMAC-SHA-256**(`challenge_id`를 함께 넣기)으로 저장한다.
2. **CSPRNG로 생성** (`SecureRandom`), 앞자리 0을 보존하도록 문자열 6자리로 다룬다. 비교는 상수 시간.
3. **유효시간을 짧게**(예: 3~5분), **1회용**: 검증 성공 시 `consumed_at`을 원자적으로 기록해 재사용을 막는다.
4. **시도 횟수 제한**(챌린지당)과 **재전송 제한**(쿨다운 + 챌린지당 횟수 + 사용자/IP/목적지 단위 제한). 문자/알림톡은 건당 비용이 있어 남용(문자 폭탄)을 막아야 한다.
5. **챌린지에 사용자 + 기기를 묶는다.** 다른 시도에서 받은 코드는 통과하지 않는다.
6. **목적지는 서버가 유저 테이블에서만 꺼낸다.** 클라이언트가 보낸 번호/주소는 쓰지 않는다. 앱에는 마스킹된 값만 준다.
7. 코드를 **로그에 남기지 않는다.** 발송 실패 시 코드를 응답/로그에 노출하지 않는다.
8. 코드를 보낸 뒤 **같은 챌린지의 수단 변경**을 제한한다(수단을 바꿔 재요청하는 횟수도 제한).
9. 검증은 **한 트랜잭션**에서: 챌린지 조회(만료/소진/시도 초과) → 코드 비교 → 성공 시 `consumed_at` 갱신 + 기기 등록 + 이력, 실패 시 `attempt_count` 증가.

최초 1회만 인증한다는 정책의 전제: 이후 로그인 보안은 **기기 값을 아는 것**에 의존한다 (`device-binding.md`). 기기를 못 알아보면(예: iOS 재설치로 Keychain이 지워짐) 다시 인증으로 폴백한다.

## 2. DDL (MySQL 8, InnoDB, UTF-8)

공통 규칙: 시각은 **UTC로 저장**하고 `DATETIME(3)`을 쓴다 (`TIMESTAMP`는 2038년 한계). UUID/해시 컬럼은 `ascii_bin`으로 인덱스를 작게 유지. `user_id`의 타입/길이는 **기존 유저 테이블 PK와 같게** 맞추고 FK를 건다 (유저 테이블 이름/컬럼은 모름: `<user_table>`로 표기).

```sql
-- 사용자당 등록 기기 1대, 기기당 사용자 1명 (1:1)
CREATE TABLE user_device (
  user_id               VARCHAR(50)  NOT NULL,
  device_id             CHAR(36)     CHARACTER SET ascii COLLATE ascii_bin NOT NULL,  -- 앱이 만든 랜덤 UUID v4
  android_id_hash       CHAR(64)     CHARACTER SET ascii COLLATE ascii_bin NULL,      -- HMAC-SHA-256(hex), Android만
  platform              VARCHAR(10)  NOT NULL,                                        -- IOS | ANDROID
  os_version            VARCHAR(30)  NULL,
  device_model          VARCHAR(100) NULL,
  app_version           VARCHAR(20)  NULL,
  push_token            VARCHAR(255) NULL,
  push_token_type       VARCHAR(10)  NULL,                                            -- EXPO | FCM | APNS
  push_token_updated_at DATETIME(3)  NULL,
  registered_at         DATETIME(3)  NOT NULL,
  last_login_at         DATETIME(3)  NULL,
  last_login_ip         VARCHAR(45)  NULL,
  updated_at            DATETIME(3)  NOT NULL,
  PRIMARY KEY (user_id),
  UNIQUE KEY uq_user_device_device_id (device_id),
  UNIQUE KEY uq_user_device_android_id_hash (android_id_hash),   -- NULL은 여러 개 허용
  CONSTRAINT ck_user_device_platform CHECK (platform IN ('IOS', 'ANDROID')),
  CONSTRAINT fk_user_device_user FOREIGN KEY (user_id) REFERENCES `<user_table>` (`<user_id_column>`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 기기 변경 감사 이력 (금융 서비스 권장. 필요 없으면 생략 가능)
CREATE TABLE user_device_history (
  history_id       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id          VARCHAR(50)  NOT NULL,
  old_device_id    CHAR(36)     CHARACTER SET ascii COLLATE ascii_bin NULL,           -- 최초 등록이면 NULL
  new_device_id    CHAR(36)     CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  platform         VARCHAR(10)  NOT NULL,
  reason           VARCHAR(20)  NOT NULL,   -- FIRST_REGISTER | DEVICE_CHANGE | DEVICE_TAKEN_BY_OTHER_USER
  verified_method  VARCHAR(10)  NOT NULL,   -- TOTP | SMS | EMAIL | KAKAO
  changed_at       DATETIME(3)  NOT NULL,
  client_ip        VARCHAR(45)  NULL,
  PRIMARY KEY (history_id),
  KEY ix_udh_user_changed (user_id, changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 로그인 시도 단위 추가 인증
CREATE TABLE auth_challenge (
  challenge_id   CHAR(36)     CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  user_id        VARCHAR(50)  NOT NULL,
  device_id      CHAR(36)     CHARACTER SET ascii COLLATE ascii_bin NOT NULL,         -- 이 시도의 기기
  device_state   VARCHAR(10)  NOT NULL,   -- NONE | MATCH | CHANGED
  method         VARCHAR(10)  NULL,       -- TOTP | SMS | EMAIL | KAKAO. 타입 1은 사용자가 고를 때까지 NULL
  code_hash      CHAR(64)     CHARACTER SET ascii COLLATE ascii_bin NULL,             -- HMAC-SHA-256(hex). TOTP는 NULL
  expires_at     DATETIME(3)  NOT NULL,
  attempt_count  TINYINT UNSIGNED NOT NULL DEFAULT 0,
  max_attempts   TINYINT UNSIGNED NOT NULL,
  send_count     TINYINT UNSIGNED NOT NULL DEFAULT 0,
  last_sent_at   DATETIME(3)  NULL,
  consumed_at    DATETIME(3)  NULL,       -- NOT NULL이면 재사용 불가
  created_at     DATETIME(3)  NOT NULL,
  client_ip      VARCHAR(45)  NULL,
  PRIMARY KEY (challenge_id),
  KEY ix_auth_challenge_user (user_id, created_at),
  KEY ix_auth_challenge_expires (expires_at),               -- 만료 정리 배치용
  CONSTRAINT ck_auth_challenge_state CHECK (device_state IN ('NONE', 'MATCH', 'CHANGED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 기존 유저 테이블에 추가 (TOTP 재사용 방지)
ALTER TABLE `<user_table>` ADD COLUMN otp_last_accepted_step BIGINT UNSIGNED NULL;
-- 기존 OTP 비밀키 컬럼은 암호화 저장 권장. otp_type: 0 = TOTP, 1 = 문자/메일/카카오
```

**기기 등록(1:1) 트랜잭션** — 사용자 B가 인증을 통과해 기기 D를 등록할 때:

```sql
START TRANSACTION;
-- D가 다른 사용자에게 묶여 있으면 그 바인딩을 이력과 함께 제거
DELETE FROM user_device WHERE device_id = ? AND user_id <> ?;      -- (이력: DEVICE_TAKEN_BY_OTHER_USER)
-- B의 바인딩을 등록/교체
INSERT INTO user_device (user_id, device_id, …, registered_at, updated_at)
VALUES (?, ?, …, UTC_TIMESTAMP(3), UTC_TIMESTAMP(3))
ON DUPLICATE KEY UPDATE device_id = VALUES(device_id), android_id_hash = VALUES(android_id_hash),
                        platform = VALUES(platform), registered_at = VALUES(registered_at), updated_at = VALUES(updated_at);
-- + user_device_history INSERT
COMMIT;
```

- `ON DUPLICATE KEY`는 PK(`user_id`)와 유니크 키 둘 다 걸리므로, 위처럼 **먼저 충돌하는 다른 사용자의 행을 삭제**한 뒤 실행한다.
- 한 사용자가 여러 기기를 쓰게 정책이 바뀌면 PK를 `(user_id, device_id)`로 바꿔야 한다.

## 3. API

경로/형식은 `conventions.md`. 요청/응답 예시는 모두 더미 값이다.

| 엔드포인트 | 요청 | 응답 |
| --- | --- | --- |
| `POST /v1/auth/login` | `userId`, `password`, `device{deviceId, androidId?, platform, osVersion, deviceModel, appVersion}`, `pushToken?` | 200 `AUTHENTICATED`(+ `Access-Token` 헤더) 또는 200 `CHALLENGE_REQUIRED` |
| `POST /v1/auth/challenges/{challengeId}/send` | `method` (`SMS`/`EMAIL`/`KAKAO`) | 204. 쿨다운/횟수 제한 초과 시 429 |
| `POST /v1/auth/challenges/{challengeId}/verify` | `code`, `confirmDevice` | 200 `AUTHENTICATED` + `Access-Token` 헤더 |
| `POST /v1/auth/logout` | — | 204 |
| `PUT /v1/devices/current/push-token` | `pushToken`, `type` | 204 (로그인 필요) |

```json
// 200 — 인증 완료 (OTP 타입 1 + 등록된 기기)
{ "status": "AUTHENTICATED", "userType": 1 }

// 200 — 추가 인증 필요
{ "status": "CHALLENGE_REQUIRED", "challengeId": "00000000-0000-4000-8000-000000000000",
  "deviceState": "CHANGED",
  "methods": [ { "method": "SMS", "destination": "***-****-0000" },
               { "method": "EMAIL", "destination": "a***@example.invalid" } ] }
// TOTP 사용자: "methods": [ { "method": "TOTP" } ]  (MATCH여도 항상)
```

- `deviceState`: `NONE`(등록 없음) | `MATCH` | `CHANGED`. `CHANGED`/`NONE`이면 `verify`에서 `confirmDevice: true`가 있어야 등록/교체한다.
- 사용자 타입 10 → `403` + `ACCOUNT_TYPE_NOT_ALLOWED`. 점검 → `503` + `MAINTENANCE` (타입별 점검은 비밀번호 확인 이후 판단). 비밀번호 오류는 계정 존재 여부를 알 수 없게 같은 `401 INVALID_CREDENTIALS`.
- **기기 정책(확정):** 관리자가 계정을 새로 만들면 기기 값은 비어 있다(= `NONE`, 행 없음/NULL). **비밀번호 초기화는 비밀번호만 바꾸고 기기 값은 그대로 둔다.** 별도의 기기 초기화 기능은 만들지 않는다 (다른 폰에서 로그인하면 어차피 인증을 다시 하므로).

## 4. 서버에 확인할 것 (서버 제작 시점에)

현재는 앱에 집중하고 서버 작업은 보류한다. 보류 항목:
1. 유저 테이블 이름/PK 타입, `otp_type`·메일·전화·카카오 컬럼, OTP 비밀키 암호화 계획.
2. 새 토큰 헤더 `Access-Token`(값은 `Bearer` 없이 JWT)과 이전 토큰 허용 여부, 절대 만료 상한.
3. 푸시를 서버에서 보내는 방식 (`device-binding.md`의 푸시 절).

확정된 정책: 문자/카카오는 엠엔와이즈, 메일은 Outlook으로 발송한다 (`server-stack.md`). 이전 기기 알림은 하지 않는다. 기기 초기화 기능은 만들지 않는다.
