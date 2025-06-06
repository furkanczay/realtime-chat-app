import CryptoJS from "crypto-js";

// Anahtar türetme fonksiyonu (iki kullanıcının ID'lerinden ortak anahtar üret)
export function generateRoomKey(userId1: number, userId2: number): string {
  // İki kullanıcının ID'sini sıralayıp birleştir (tutarlı anahtar için)
  const sortedIds = [userId1, userId2].sort().join("-");
  // SHA256 ile hash'le ve ilk 32 karakteri al
  return CryptoJS.SHA256(sortedIds + "realtime-chat-secret")
    .toString()
    .substring(0, 32);
}

// Mesaj şifreleme
export function encryptMessage(message: string, roomKey: string): string {
  try {
    const encrypted = CryptoJS.AES.encrypt(message, roomKey).toString();
    return encrypted;
  } catch (error) {
    console.error("Mesaj şifreleme hatası:", error);
    throw new Error("Mesaj şifrelenemedi");
  }
}

// Mesaj şifre çözme
export function decryptMessage(
  encryptedMessage: string,
  roomKey: string
): string {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, roomKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    if (!decrypted) {
      throw new Error("Şifre çözme başarısız");
    }

    return decrypted;
  } catch (error) {
    console.error("Mesaj şifre çözme hatası:", error);
    return "[Şifrelenmiş mesaj - çözülemedi]";
  }
}

// Şifreleme durumunu kontrol et
export function isValidEncryption(encryptedText: string): boolean {
  try {
    // Base64 formatını kontrol et (AES şifrelemesi Base64 formatında döner)
    return /^[A-Za-z0-9+/=]+$/.test(encryptedText) && encryptedText.length > 20;
  } catch {
    return false;
  }
}

// Test fonksiyonu (geliştirme amaçlı)
export function testEncryption() {
  const testMessage = "Bu bir test mesajıdır!";
  const testKey = generateRoomKey(1, 2);

  console.log("Test Mesajı:", testMessage);
  console.log("Anahtar:", testKey);

  const encrypted = encryptMessage(testMessage, testKey);
  console.log("Şifrelenmiş:", encrypted);

  const decrypted = decryptMessage(encrypted, testKey);
  console.log("Şifresi Çözülmüş:", decrypted);

  return testMessage === decrypted;
}
