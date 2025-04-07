'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function AdminSetup() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      // 檢查 users 表格是否存在 role 欄位
      const { data: hasRoleColumn, error: schemaError } = await supabase
        .from('users')
        .select('role')
        .limit(1)
        .single();

      if (schemaError && schemaError.code === '42703') {
        // 如果 role 欄位不存在，嘗試新增它
        const { error: alterError } = await supabase.rpc('add_role_column');
        if (alterError) {
          setError(`無法新增 role 欄位：${alterError.message}`);
          return;
        }
      }

      // 獲取用戶資料
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (userError) {
        setError(`獲取用戶資料時發生錯誤：${userError.message}`);
        return;
      }

      setUser(userData);
    } catch (error: any) {
      console.error('Error:', error);
      setError(`檢查用戶時發生錯誤：${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const makeAdmin = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setMessage('');
      setError(null);

      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '更新角色失敗');
      }

      setMessage('成功設置為管理員！你現在可以訪問管理面板了。');
      await checkUser();
    } catch (error: any) {
      console.error('Error:', error);
      setError(`更新角色時發生錯誤：${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            管理員設定
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            設定你的管理員權限
          </p>
        </div>
        
        {user && (
          <div className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm -space-y-px">
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">電子郵件</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {user.email}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">當前角色</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {user.role || '一般用戶'}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">用戶 ID</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {user.id}
                </dd>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {user.role !== 'admin' && (
              <div>
                <button
                  onClick={makeAdmin}
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {loading ? '處理中...' : '設為管理員'}
                </button>
              </div>
            )}

            {message && (
              <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-800">
                      {message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {user.role === 'admin' && (
              <div className="text-center">
                <button
                  onClick={() => router.push('/admin')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  前往管理面板
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 