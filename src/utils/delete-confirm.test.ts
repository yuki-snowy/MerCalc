/** @vitest-environment jsdom */

import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  closeDeleteConfirmDialog,
  initDeleteConfirm,
  isDeleteConfirmOpen,
  openDeleteConfirmDialog,
} from './delete-confirm';

function createFixture() {
  document.body.innerHTML = `
    <form id="delete-asset-form">
      <button type="button" id="delete-asset-trigger">資産を削除</button>
    </form>
    <dialog id="delete-asset-dialog">
      <button type="button" data-delete-cancel>キャンセル</button>
      <button type="button" data-delete-confirm>削除する</button>
    </dialog>
  `;

  const form = document.getElementById(
    'delete-asset-form',
  ) as HTMLFormElement;
  const trigger = document.getElementById('delete-asset-trigger')!;
  const dialog = document.getElementById(
    'delete-asset-dialog',
  ) as HTMLDialogElement;
  const confirmButton = dialog.querySelector<HTMLElement>(
    '[data-delete-confirm]',
  );
  const cancelButton = dialog.querySelector<HTMLElement>('[data-delete-cancel]');

  return { form, trigger, dialog, confirmButton, cancelButton };
}

describe('open/closeDeleteConfirmDialog', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('ダイアログを開閉できる', () => {
    const dialog = document.createElement('dialog');
    document.body.appendChild(dialog);

    openDeleteConfirmDialog(dialog);
    expect(isDeleteConfirmOpen(dialog)).toBe(true);

    closeDeleteConfirmDialog(dialog);
    expect(isDeleteConfirmOpen(dialog)).toBe(false);
  });
});

describe('initDeleteConfirm', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('要素が欠けていれば何もしない', () => {
    expect(initDeleteConfirm({ form: null, trigger: null, dialog: null })).toBeTypeOf(
      'function',
    );
  });

  it('削除ボタンだけでは送信せず、確認ダイアログを開く', () => {
    const { form, trigger, dialog } = createFixture();
    const requestSubmit = vi.fn();
    form.requestSubmit = requestSubmit;

    initDeleteConfirm({ form, trigger, dialog });
    trigger.click();

    expect(isDeleteConfirmOpen(dialog)).toBe(true);
    expect(requestSubmit).not.toHaveBeenCalled();
  });

  it('キャンセルでダイアログを閉じ、送信しない', () => {
    const { form, trigger, dialog, cancelButton } = createFixture();
    const requestSubmit = vi.fn();
    form.requestSubmit = requestSubmit;

    initDeleteConfirm({ form, trigger, dialog });
    trigger.click();
    cancelButton?.click();

    expect(isDeleteConfirmOpen(dialog)).toBe(false);
    expect(requestSubmit).not.toHaveBeenCalled();
  });

  it('確定ボタンでのみフォームを送信する', () => {
    const { form, trigger, dialog, confirmButton } = createFixture();
    const requestSubmit = vi.fn();
    form.requestSubmit = requestSubmit;

    initDeleteConfirm({ form, trigger, dialog });
    trigger.click();
    confirmButton?.click();

    expect(requestSubmit).toHaveBeenCalledTimes(1);
    expect(isDeleteConfirmOpen(dialog)).toBe(false);
  });

  it('背景クリックでダイアログを閉じる', () => {
    const { form, trigger, dialog } = createFixture();

    initDeleteConfirm({ form, trigger, dialog });
    trigger.click();
    expect(isDeleteConfirmOpen(dialog)).toBe(true);

    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(isDeleteConfirmOpen(dialog)).toBe(false);
  });
});
