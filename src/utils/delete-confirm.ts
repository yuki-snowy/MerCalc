export type DeleteConfirmElements = {
  form: HTMLFormElement | null;
  trigger: HTMLElement | null;
  dialog: HTMLDialogElement | null;
  confirmButton?: HTMLElement | null;
  cancelButton?: HTMLElement | null;
};

export function openDeleteConfirmDialog(dialog: HTMLDialogElement): void {
  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
    return;
  }
  dialog.setAttribute('open', '');
}

export function closeDeleteConfirmDialog(dialog: HTMLDialogElement): void {
  if (typeof dialog.close === 'function') {
    dialog.close();
    return;
  }
  dialog.removeAttribute('open');
}

export function isDeleteConfirmOpen(dialog: HTMLDialogElement): boolean {
  return Boolean(dialog.open) || dialog.hasAttribute('open');
}

/**
 * 削除ボタン押下時に確認ダイアログを開き、
 * 明示的な確定操作でのみフォーム送信する。
 */
export function initDeleteConfirm({
  form,
  trigger,
  dialog,
  confirmButton,
  cancelButton,
}: DeleteConfirmElements): () => void {
  if (!form || !trigger || !dialog) return () => {};

  const confirmEl =
    confirmButton ??
    dialog.querySelector<HTMLElement>('[data-delete-confirm]');
  const cancelEl =
    cancelButton ?? dialog.querySelector<HTMLElement>('[data-delete-cancel]');

  const onTriggerClick = (event: Event) => {
    event.preventDefault();
    openDeleteConfirmDialog(dialog);
  };

  const onCancel = (event: Event) => {
    event.preventDefault();
    closeDeleteConfirmDialog(dialog);
  };

  const onConfirm = (event: Event) => {
    event.preventDefault();
    closeDeleteConfirmDialog(dialog);
    if (typeof form.requestSubmit === 'function') {
      form.requestSubmit();
      return;
    }
    form.submit();
  };

  const onBackdropClick = (event: MouseEvent) => {
    if (event.target === dialog) {
      closeDeleteConfirmDialog(dialog);
    }
  };

  trigger.addEventListener('click', onTriggerClick);
  confirmEl?.addEventListener('click', onConfirm);
  cancelEl?.addEventListener('click', onCancel);
  dialog.addEventListener('click', onBackdropClick);

  return () => {
    trigger.removeEventListener('click', onTriggerClick);
    confirmEl?.removeEventListener('click', onConfirm);
    cancelEl?.removeEventListener('click', onCancel);
    dialog.removeEventListener('click', onBackdropClick);
  };
}
