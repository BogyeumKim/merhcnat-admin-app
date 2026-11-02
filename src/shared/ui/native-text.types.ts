export type NativeTextVariant = 'largeTitle' | 'title' | 'headline' | 'label' | 'body' | 'subhead' | 'caption';
export type NativeTextTone = 'default' | 'secondary' | 'danger';

export type NativeTextProps = {
  children: string;
  variant?: NativeTextVariant;
  tone?: NativeTextTone;
  center?: boolean;
};
