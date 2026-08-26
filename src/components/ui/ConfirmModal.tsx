import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { X } from 'lucide-react-native';

import { Colors } from '@/constants';
import { hexWithAlpha } from '@/utils';
import type { ConfirmModalProps } from '@/types';

export type { ConfirmModalProps } from '@/types';

const danger = '#DC2F2F';

export function ConfirmModal({
  visible,
  title,
  message,
  cancelText = 'Vazgeç',
  confirmText = 'Onayla',
  destructive = false,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <View style={S.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />

        <View style={S.card}>
          <View style={S.header}>
            <Text style={S.title} numberOfLines={1}>
              {title}
            </Text>
            <Pressable style={S.closeBtn} hitSlop={6} onPress={onCancel}>
              <X size={16} color={hexWithAlpha(Colors.secondary, 0.6)} />
            </Pressable>
          </View>

          <View style={S.hr} />

          <View style={S.body}>
            <Text style={S.message}>{message}</Text>
          </View>

          <View style={S.hr} />

          <View style={S.footer}>
            <Pressable style={S.cancelBtn} onPress={onCancel}>
              <Text style={S.cancelTxt}>{cancelText}</Text>
            </Pressable>
            <Pressable
              style={[S.confirmBtn, destructive && S.confirmBtnDanger]}
              onPress={onConfirm}
            >
              <Text style={[S.confirmTxt, destructive && S.confirmTxtDanger]}>{confirmText}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const S = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: hexWithAlpha(Colors.secondary, 0.55),
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 10,
  },
  title: {
    flexShrink: 1,
    fontSize: 18,
    fontFamily: 'Archivo_800ExtraBold',
    color: Colors.secondary,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: hexWithAlpha(Colors.secondary, 0.06),
  },
  hr: {
    height: 1,
    backgroundColor: hexWithAlpha(Colors.secondary, 0.08),
  },
  body: {
    paddingHorizontal: 18,
    paddingVertical: 20,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Archivo_400Regular',
    color: hexWithAlpha(Colors.secondary, 0.55),
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  cancelBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: hexWithAlpha(Colors.secondary, 0.12),
    backgroundColor: hexWithAlpha(Colors.secondary, 0.03),
  },
  cancelTxt: {
    fontSize: 14,
    fontFamily: 'Archivo_600SemiBold',
    color: Colors.secondary,
  },
  confirmBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: hexWithAlpha(Colors.secondary, 0.12),
    backgroundColor: Colors.white,
  },
  confirmBtnDanger: {
    borderColor: danger,
  },
  confirmTxt: {
    fontSize: 14,
    fontFamily: 'Archivo_600SemiBold',
    color: Colors.secondary,
  },
  confirmTxtDanger: {
    color: danger,
  },
});

export default ConfirmModal;
