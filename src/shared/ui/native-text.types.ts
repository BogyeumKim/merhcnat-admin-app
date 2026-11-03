export type NativeTextVariant = 'largeTitle' | 'title' | 'headline' | 'label' | 'fieldLabel' | 'body' | 'subhead' | 'caption';
export type NativeTextTone = 'default' | 'secondary' | 'danger' | 'onAction';

export type NativeTextProps = {
  children: string;
  variant?: NativeTextVariant;
  tone?: NativeTextTone;
  center?: boolean;
};
