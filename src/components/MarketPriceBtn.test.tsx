/** @vitest-environment jsdom */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import MarketPriceBtn from './MarketPriceBtn';

describe('MarketPriceBtn', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('製品名未入力ならエラーを表示する', async () => {
    const user = userEvent.setup();
    render(<MarketPriceBtn name="" />);

    await user.click(screen.getByRole('button', { name: '中古相場を更新' }));
    expect(screen.getByText('製品名を入力してください')).toBeInTheDocument();
  });

  it('相場 API 成功時に推定結果を表示する', async () => {
    const user = userEvent.setup();

    document.body.innerHTML = `
      <input id="name" value="iPad Air" />
      <input id="market_price" value="" />
      <select id="category"><option selected>ガジェット</option></select>
      <select id="condition"><option selected value="good">良い</option></select>
      <input id="purchase_price" value="100000" />
    `;

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          estimatedPrice: 65000,
          confidence: 0.72,
          searchUrl: 'https://jp.mercari.com/search?keyword=iPad+Air',
          note: '推定です',
          fetchedAt: '2024-01-01T00:00:00.000Z',
        }),
      }),
    );

    render(
      <MarketPriceBtn
        name="iPad Air"
        category="ガジェット"
        condition="good"
        purchasePrice={100000}
      />,
    );

    await user.click(screen.getByRole('button', { name: '中古相場を更新' }));

    await waitFor(() => {
      expect(screen.getByText(/推定相場/)).toBeInTheDocument();
    });
    expect(screen.getByText(/¥65,000/)).toBeInTheDocument();
    expect(
      (document.getElementById('market_price') as HTMLInputElement).value,
    ).toBe('65000');
  });
});
