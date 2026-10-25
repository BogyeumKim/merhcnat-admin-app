export type NativeTextVariant = 'title' | 'headline' | 'body' | 'subhead' | 'caption';
export type NativeTextTone = 'default' | 'secondary' | 'danger';

export type NativeTextProps = {
  children: string;
  variant?: NativeTextVariant;
  tone?: NativeTextTone;
  center?: boolean;
};
