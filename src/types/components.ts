import type { LucideIcon } from 'lucide-react-native';

export type FilterOption = {
  id: number;
  name: string;
  count: number;
  icon?: LucideIcon;
  iconBg?: string;
  iconFg?: string;
};

export type ConfirmModalProps = {
  visible: boolean;
  title: string;
  message: string;
  cancelText?: string;
  confirmText?: string;
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};
