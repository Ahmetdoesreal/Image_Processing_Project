# Image Spatter Electron demosu

Kayıtlar, uygulamayla gelen kontrol ve kontrollü düzenleme örneklerini kullanır. Üç panelde giriş görüntüsü ve iki JPEG kalitesinin ELA haritaları gösterilir.

## JPEG kalitelerini karşılaştır

**Örnek** menüsünden **Kontrollü düzenleme** seçilir. Ardından **JPEG A** değeri 80’den 20’ye düşürülür ve **Karşılaştır** ile haritalar yeniden hesaplanır.

![Kontrol örneğinden düzenlenmiş örneğe geçiş ve JPEG A kalitesinin 80’den 20’ye düşürülmesi](docs/electron-demo/ela-quality-comparison.gif)

## Aynı bölgeyi üç panelde incele

%200 yakınlaştırmada bir paneli sürükleyince üç görünüm birlikte kayar. **Üst üste göster** ile ELA haritaları görüntünün üzerine gelir. Opaklık değiştirildikten sonra **Yakınlaştırmayı sıfırla** tam görüntüye döner.

![Bağlantılı yakınlaştırma ve kaydırma, ELA katmanı opaklık kontrolü ve görünümü sıfırlama](docs/electron-demo/linked-inspection.gif)

## Karşılaştırmayı PNG olarak kaydet

**PNG olarak kaydet** ile giriş görüntüsü ve iki ELA sonucu tek bir dosyaya yazılır. PNG, tam görüntüleri JPEG kalite değerleri, ölçümler ve seçilen ELA katmanı opaklığıyla birlikte içerir.

![PNG olarak kaydet düğmesi ve dosyanın kaydedildiğini bildiren uygulama mesajı](docs/electron-demo/png-export.gif)

[Kurulum ve çalıştırma](README.md#v1-masaüstü-uygulaması)
