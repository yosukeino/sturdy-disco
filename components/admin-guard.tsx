'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, KeyRound, ArrowLeft, Lock, Unlock } from 'lucide-react';

const TEACHER_PIN = (process.env.NEXT_PUBLIC_TEACHER_PIN || '7777').trim();

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('teacher_mode_unlocked');
      if (saved === 'true') {
        setUnlocked(true);
      }
    } catch {}
    setChecking(false);
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim() === TEACHER_PIN) {
      try {
        localStorage.setItem('teacher_mode_unlocked', 'true');
      } catch {}
      setUnlocked(true);
      setError(null);
    } else {
      setError('講師用パスワード（PIN）が正しくありません');
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        読み込み中...
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-slate-800 bg-slate-900/95 text-white shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <CardTitle className="text-xl font-black tracking-tight text-white">
              講師専用管理コンソール
            </CardTitle>
            <p className="text-xs text-slate-400 mt-1">
              教材のアップロード・テスト作成・進捗管理を行うには講師用パスコードを入力してください。
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleUnlock} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-indigo-400" />
                  <span>講師用パスコード（PIN）</span>
                </label>
                <Input
                  type="password"
                  inputMode="numeric"
                  placeholder="パスコードを入力"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setError(null);
                  }}
                  className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-500 text-center text-lg tracking-widest font-mono h-11"
                  autoFocus
                />
                {error && (
                  <p className="text-xs font-bold text-rose-400 text-center pt-1">
                    {error}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black h-11"
              >
                <Unlock className="h-4 w-4 mr-1.5" />
                ロックを解除して管理画面へ
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-800 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>生徒向けポータル（パスワード不要）へ戻る</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
