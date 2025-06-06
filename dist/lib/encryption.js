"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRoomKey = generateRoomKey;
exports.encryptMessage = encryptMessage;
exports.decryptMessage = decryptMessage;
exports.isValidEncryption = isValidEncryption;
exports.testEncryption = testEncryption;
const crypto_js_1 = __importDefault(require("crypto-js"));
// Anahtar türetme fonksiyonu (iki kullanıcının ID'lerinden ortak anahtar üret)
function generateRoomKey(userId1, userId2) {
    // İki kullanıcının ID'sini sıralayıp birleştir (tutarlı anahtar için)
    const sortedIds = [userId1, userId2].sort().join("-");
    // SHA256 ile hash'le ve ilk 32 karakteri al
    return crypto_js_1.default.SHA256(sortedIds + "realtime-chat-secret")
        .toString()
        .substring(0, 32);
}
// Mesaj şifreleme
function encryptMessage(message, roomKey) {
    try {
        const encrypted = crypto_js_1.default.AES.encrypt(message, roomKey).toString();
        return encrypted;
    }
    catch (error) {
        console.error("Mesaj şifreleme hatası:", error);
        throw new Error("Mesaj şifrelenemedi");
    }
}
// Mesaj şifre çözme
function decryptMessage(encryptedMessage, roomKey) {
    try {
        const bytes = crypto_js_1.default.AES.decrypt(encryptedMessage, roomKey);
        const decrypted = bytes.toString(crypto_js_1.default.enc.Utf8);
        if (!decrypted) {
            throw new Error("Şifre çözme başarısız");
        }
        return decrypted;
    }
    catch (error) {
        console.error("Mesaj şifre çözme hatası:", error);
        return "[Şifrelenmiş mesaj - çözülemedi]";
    }
}
// Şifreleme durumunu kontrol et
function isValidEncryption(encryptedText) {
    try {
        // Base64 formatını kontrol et (AES şifrelemesi Base64 formatında döner)
        return /^[A-Za-z0-9+/=]+$/.test(encryptedText) && encryptedText.length > 20;
    }
    catch {
        return false;
    }
}
// Test fonksiyonu (geliştirme amaçlı)
function testEncryption() {
    const testMessage = "Bu bir test mesajıdır!";
    const testKey = generateRoomKey("test1", "test2");
    console.log("Test Mesajı:", testMessage);
    console.log("Anahtar:", testKey);
    const encrypted = encryptMessage(testMessage, testKey);
    console.log("Şifrelenmiş:", encrypted);
    const decrypted = decryptMessage(encrypted, testKey);
    console.log("Şifresi Çözülmüş:", decrypted);
    return testMessage === decrypted;
}
