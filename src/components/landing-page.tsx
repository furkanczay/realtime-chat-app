"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Shield, 
  Zap, 
  Users, 
  Lock, 
  Smartphone,
  ArrowRight,
  CheckCircle,
  Star,
  Globe
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">ChatApp</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                  Giriş Yap
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg">
                  Ücretsiz Başla
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="relative inline-block">
            <Badge className="mb-4 md:mb-6 bg-gradient-to-r from-green-100 to-blue-100 text-green-700 border border-green-200/50 hover:border-green-300 hover:shadow-lg transition-all duration-300 backdrop-blur-sm text-sm">
              <Star className="h-3 w-3 mr-1 text-yellow-500" />
              🚀 Telegram'dan daha iyi ve güvenli!
            </Badge>
            <div className="absolute -top-1 -right-1 w-2 h-2 md:w-3 md:h-3 bg-green-400 rounded-full animate-ping"></div>
          </div>
          
          <div className="relative">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
              <span className="inline-block animate-fade-in-up">Güvenli ve</span>{" "}
              <span className="relative inline-block animate-fade-in-up animation-delay-200">
                <span className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-gradient-x bg-[length:200%_200%]">
                  Modern
                </span>
                <div className="absolute -top-2 -right-4 md:-top-4 md:-right-8 w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                  <MessageCircle className="h-3 w-3 md:h-4 md:w-4 text-white" />
                </div>
              </span>
              <br />
              <span className="inline-block animate-fade-in-up animation-delay-400">Sohbet</span>
            </h1>
            
            {/* Floating elements around the title - Hidden on mobile */}
            <div className="hidden lg:flex absolute -top-8 left-1/4 w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl items-center justify-center animate-float animation-delay-1000">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div className="hidden lg:flex absolute top-16 -right-8 w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full items-center justify-center animate-float animation-delay-2000">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div className="hidden lg:flex absolute -bottom-4 left-1/3 w-7 h-7 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg items-center justify-center animate-float animation-delay-3000">
              <Lock className="h-3 w-3 text-white" />
            </div>
          </div>
          
          <p className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-6 md:mb-8 max-w-3xl lg:max-w-4xl mx-auto leading-relaxed animate-fade-in-up animation-delay-800">
            <span className="font-semibold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Uçtan uca şifreleme
            </span> ile arkadaşlarınızla güvenle sohbet edin. 
            <br className="hidden sm:block" />
            Markdown desteği, gerçek zamanlı mesajlaşma ve modern arayüz.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center mb-8 md:mb-12 animate-fade-in-up animation-delay-1000">
            <Link href="/register">
              <Button 
                size="lg" 
                className="w-full sm:w-auto group bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-2xl hover:shadow-green-500/25 transform hover:scale-105 md:hover:scale-110 transition-all duration-300 px-8 md:px-12 py-4 md:py-6 text-lg md:text-xl font-bold rounded-xl md:rounded-2xl relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative z-10 flex items-center justify-center">
                  Ücretsiz Başla
                  <ArrowRight className="ml-2 md:ml-3 h-5 w-5 md:h-6 md:w-6 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Button>
            </Link>
            <Link href="/login">
              <Button 
                variant="outline" 
                size="lg"
                className="w-full sm:w-auto group border-2 border-gray-300 hover:border-gradient-to-r hover:from-green-500 hover:to-blue-500 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 hover:text-gray-800 px-8 md:px-12 py-4 md:py-6 text-lg md:text-xl font-semibold rounded-xl md:rounded-2xl transition-all duration-300 hover:shadow-xl"
              >
                <span className="flex items-center justify-center">
                  Zaten Hesabın Var mı?
                  <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Button>
            </Link>
          </div>

          {/* Enhanced Trust Indicators - Simplified on mobile */}
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 animate-fade-in-up animation-delay-1200">
            <div className="flex items-center gap-2 md:gap-3 bg-white/80 backdrop-blur-sm rounded-full px-4 md:px-6 py-2 md:py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center">
                <Shield className="h-3 w-3 md:h-4 md:w-4 text-white" />
              </div>
              <span className="font-semibold text-gray-700 text-sm md:text-base">Uçtan uca şifreleme</span>
            </div>
            <div className="flex items-center gap-2 md:gap-3 bg-white/80 backdrop-blur-sm rounded-full px-4 md:px-6 py-2 md:py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                <Zap className="h-3 w-3 md:h-4 md:w-4 text-white" />
              </div>
              <span className="font-semibold text-gray-700 text-sm md:text-base">Anlık mesajlaşma</span>
            </div>
            <div className="flex items-center gap-2 md:gap-3 bg-white/80 backdrop-blur-sm rounded-full px-4 md:px-6 py-2 md:py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                <Users className="h-3 w-3 md:h-4 md:w-4 text-white" />
              </div>
              <span className="font-semibold text-gray-700 text-sm md:text-base">Ücretsiz kullanım</span>
            </div>
          </div>
        </div>

        {/* Enhanced Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated gradient orbs */}
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full mix-blend-multiply filter blur-2xl animate-blob"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 rounded-full mix-blend-multiply filter blur-2xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-r from-green-400/30 to-blue-400/30 rounded-full mix-blend-multiply filter blur-2xl animate-blob animation-delay-4000"></div>
          
          {/* Floating geometric shapes */}
          <div className="absolute top-32 right-1/4 w-4 h-4 bg-green-400 rounded-full animate-float opacity-60"></div>
          <div className="absolute top-64 left-1/3 w-3 h-3 bg-blue-400 rounded-full animate-float animation-delay-1000 opacity-60"></div>
          <div className="absolute bottom-64 right-1/3 w-5 h-5 bg-purple-400 rounded-full animate-float animation-delay-3000 opacity-60"></div>
          
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzBfMSkiPgo8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSIjOTk5IiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L2c+CjxkZWZzPgo8Y2xpcFBhdGggaWQ9ImNsaXAwXzBfMSI+CjxyZWN0IHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0id2hpdGUiLz4KPC9jbGlwUGF0aD4KPC9kZWZzPgo8L3N2Zz4K')] opacity-20"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
              ✨ Özellikler
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Neden{" "}
              <span className="bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
                ChatApp
              </span>
              ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Modern teknolojiler ve kullanıcı odaklı tasarım ile güvenli, hızlı ve 
              eğlenceli bir sohbet deneyimi. Her detay sizin için düşünüldü.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Card className="p-6 hover:shadow-lg transition-shadow duration-200 border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">Uçtan Uca Şifreleme</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Mesajlarınız AES-256 ile şifrelenir. Sadece siz ve karşınızdaki kişi okuyabilir.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow duration-200 border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <MessageCircle className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Markdown Desteği</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  **Kalın**, *italik*, `kod` blokları ve daha fazlası ile zengin mesajlar.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow duration-200 border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Gerçek Zamanlı</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Socket.io teknolojisi ile anlık mesaj iletimi ve canlı durum göstergeleri.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow duration-200 border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-xl">Arkadaş Sistemi</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Kullanıcı arama, arkadaş ekleme ve güvenli arkadaş listesi yönetimi.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow duration-200 border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Smartphone className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-xl">Responsive Tasarım</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Mobil, tablet ve masaüstünde mükemmel görünüm ve kullanım deneyimi.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow duration-200 border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle className="text-xl">Modern Teknoloji</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Next.js, TypeScript, Prisma ve daha fazlası ile geliştirilmiş modern altyapı.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Stats Section */}
          <div className="grid md:grid-cols-4 gap-8 bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">256-bit</div>
              <div className="text-gray-600">AES Şifreleme</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">&lt;100ms</div>
              <div className="text-gray-600">Mesaj Gecikmesi</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">100%</div>
              <div className="text-gray-600">Ücretsiz</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-gray-600">Aktif Sunucu</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-200">
              🚀 Başlangıç
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Nasıl{" "}
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                Çalışır
              </span>
              ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Sadece 3 basit adımda güvenli ve modern sohbet deneyimine başlayın. 
              Hiçbir karmaşık kurulum gerektirmez!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <Card className="text-center p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-md">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg">
                1
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Hesap Oluştur</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Email adresiniz ile ücretsiz hesabınızı oluşturun. 
                Sadece birkaç saniye sürer ve hemen kullanmaya başlayabilirsiniz.
              </p>
            </Card>

            <Card className="text-center p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-md">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg">
                2
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Arkadaş Ekle</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Kullanıcı adı ile arama yapın, arkadaşlarınızı bulun ve 
                güvenli arkadaş listesi oluşturun.
              </p>
            </Card>

            <Card className="text-center p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-md">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg">
                3
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Güvenle Sohbet Et</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                AES-256 şifrelemesi ile korunan mesajlarınızla arkadaşlarınızla 
                güvenli ve eğlenceli sohbet deneyimi yaşayın.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-8 lg:p-12 text-center shadow-2xl">
            <Badge className="mb-4 bg-white/20 text-white border-white/30 backdrop-blur-sm">
              🎉 Hemen Başla
            </Badge>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Güvenli Sohbete{" "}
              <span className="relative">
                Hemen Başla
                <div className="absolute -bottom-1 left-0 right-0 h-1 bg-yellow-300 rounded-full"></div>
              </span>
            </h2>
            
            <p className="text-lg lg:text-xl text-green-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              Arkadaşlarınızla güvenli ve modern bir sohbet deneyimi yaşamak için 
              sadece birkaç saniye yeterli. Hemen ücretsiz hesabınızı oluşturun!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/register">
                <Button 
                  size="lg" 
                  className="bg-white text-green-600 hover:bg-gray-50 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 px-8 py-4 text-lg font-bold rounded-xl"
                >
                  Ücretsiz Hesap Aç
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button 
                  variant="outline"
                  size="lg" 
                  className="border-2 border-white/50 text-white hover:bg-white hover:text-green-600 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-4 text-lg font-semibold rounded-xl"
                >
                  Giriş Yap
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-6 text-green-100">
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="font-medium">100% Ücretsiz</span>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="font-medium">Güvenli</span>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="font-medium">Kolay Kurulum</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">ChatApp</span>
              </div>
              <p className="text-gray-400">
                Güvenli ve modern sohbet uygulaması.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Özellikler</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Uçtan uca şifreleme</li>
                <li>Markdown desteği</li>
                <li>Gerçek zamanlı mesajlaşma</li>
                <li>Arkadaş sistemi</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Güvenlik</h3>
              <ul className="space-y-2 text-gray-400">
                <li>AES-256 şifreleme</li>
                <li>Güvenli authentication</li>
                <li>Veri koruması</li>
                <li>Gizlilik</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Destek</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Dokümantasyon</li>
                <li>SSS</li>
                <li>İletişim</li>
                <li>Geri bildirim</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 ChatApp. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 