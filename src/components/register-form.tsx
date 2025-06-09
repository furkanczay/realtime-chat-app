"use client";

import { register } from "@/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActionState, useState } from "react";
import { MessageCircle, Mail, Lock, User, Eye, EyeOff, ArrowRight, UserPlus } from "lucide-react";
import Link from "next/link";

export default function RegisterForm() {
  const [state, action, isPending] = useActionState(register, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 auth-bg-pattern opacity-50"></div>
      
      <div className="relative w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
            <MessageCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hesap Oluşturun
          </h1>
          <p className="text-gray-600">
            Güvenli mesajlaşma dünyasına katılın
          </p>
        </div>

        {/* Register Card */}
        <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center justify-center gap-2">
              <UserPlus className="h-5 w-5" />
              Kayıt Ol
            </CardTitle>
          </CardHeader>
          <CardContent>
            {state?.error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex">
                  <div className="text-red-600 text-sm font-medium">
                    {state.error}
                  </div>
                </div>
              </div>
            )}

            <form action={action} className="space-y-5">
              {/* Name Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Ad Soyad
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    disabled={isPending}
                    type="text"
                    name="name"
                    placeholder="Adınız Soyadınız"
                    className="pl-10 h-12 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Username Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Kullanıcı Adı
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 font-mono">@</span>
                  </div>
                  <Input
                    disabled={isPending}
                    type="text"
                    name="username"
                    placeholder="kullaniciadi"
                    className="pl-10 h-12 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors font-mono"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Kullanıcı adınız benzersiz olmalıdır
                </p>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  E-posta Adresi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    disabled={isPending}
                    type="email"
                    name="email"
                    placeholder="ornek@email.com"
                    className="pl-10 h-12 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Şifre
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    disabled={isPending}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-12 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  En az 8 karakter uzunluğunda güçlü bir şifre seçin
                </p>
              </div>

              {/* Terms & Privacy */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="text-gray-700">
                    <span className="font-medium">Kullanım Şartları</span> ve{" "}
                    <span className="font-medium">Gizlilik Politikası</span>'nı
                    okudum ve kabul ediyorum
                  </label>
                </div>
              </div>

              {/* Register Button */}
              <Button 
                disabled={isPending}
                className="w-full h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Hesap Oluştur
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">veya</span>
                </div>
              </div>
            </div>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Zaten hesabınız var mı?{" "}
                <Link 
                  href="/login" 
                  className="text-green-600 hover:text-green-500 font-semibold hover:underline"
                >
                  Giriş yapın
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <span>🔒</span>
            <span>Verileriniz uçtan uca şifrelenir ve güvende tutulur</span>
          </div>
        </div>
      </div>
    </div>
  );
}
