# Image Spatter V1 Teknik Raporu

COM0418 Görüntü İşleme

Image Spatter, yerel bir görüntüyü iki farklı JPEG kalitesinde yeniden sıkıştırır ve piksel farklarını yan yana gösterir. Kontrollü deneyde üç yerleşimin tamamında kalite 80, yapıştırılan bölgeyi çevresinden ayırmada en yüksek piksel ROC-AUC değerini verdi.

## Uygulama ve yöntem

Electron arayüzünde yerel bir dosya veya hazır kontrol ve düzenleme örneklerinden biri açılır. Kullanıcı iki JPEG kalitesi seçer. Uygulama giriş görüntüsünü ve iki ELA haritasını aynı renk ölçeğinde gösterir. Yakınlaştırma ve ayarlanabilir opaklık ile harita giriş görüntüsünün üzerinde de incelenebilir.

Electron ana işlemi dosya seçiciyi yönetir. İzole preload katmanı arayüze yalnızca görüntü açma, örnek seçme ve analiz çağrılarını sunar. Ana işlem Python'u yerel bir alt süreç olarak başlatır ve önizlemelerle ölçümleri JSON olarak alır. Görüntü analizi ve görüntüleme için internet bağlantısı gerekmez. [Electron IPC belgeleri](https://www.electronjs.org/docs/latest/tutorial/ipc)

Python, dosyayı Pillow ile açar, EXIF yönünü uygular ve saydam pikselleri beyaz zemin üzerinde birleştirir. OpenCV, görüntüyü seçilen kalitede bellekte JPEG'e kodlar ve geri açar. Her pikselde üç kanalın mutlak farklarının ortalaması ELA değeridir. Haritalar 0–20 renk ölçeğiyle gösterilir. Ortalama ve 95. yüzdelik, tam çözünürlükte ve renk ölçeği uygulanmadan hesaplanır. Görüntüleme önizlemesinin uzun kenarı en fazla 1.200 pikseldir. Uygulama en fazla 24 megapiksellik görüntüleri kabul eder. [OpenCV JPEG parametresi](https://docs.opencv.org/4.8.0/d8/d6a/group__imgcodecs__flags.html) · [Forensically ELA açıklaması](https://29a.ch/photo-forensics/#error-level-analysis)

## Kontrollü deney

512 × 512 boyutlu `data/astronaut.png` görüntüsü JPEG kalite 75 ile arka plana dönüştürüldü. Kontrol görüntüsünün içeriği korunarak kalite 95 ile yeniden kaydedildi. Üç düzenlenmiş görüntünün her biri için PNG kaynaktan aynı 80 × 80 piksellik parça, arka plandaki ayrı bir konuma yapıştırıldı. Her düzenlenmiş görüntü de kalite 95 ile kaydedildi. Yapıştırma koordinatları `(390, 40)`, `(230, 165)` ve `(45, 245)` olarak seçildi.

Her eşleşmede analiz kaliteleri 20, 80 ve 95 kullanıldı. Aynı koordinattaki 80 × 80 bölgenin ortalama ELA değeri kontrol ile düzenlenmiş görüntü arasında karşılaştırıldı. Düzenlenmiş görüntüdeki piksel ROC-AUC değeri, ELA skorunun bilinen yapıştırma maskesinin içindeki ve dışındaki pikselleri ayırma gücünü ölçtü. Eşit skorlu piksel çiftleri yarım puan sayıldı. Zaman ölçümü bir ısınma turunun ardından yedi çalıştırmanın medyanıdır ve JPEG kodlama, geri açma, mutlak fark ve kanal toplamı işlemlerini kapsar. Dosya açma, önizleme aktarımı ve arayüz çizimi bu süreye dahil değildir.

## Bulgular

| Analiz kalitesi | Üç yerleşimde ortalama piksel ROC-AUC | Düzenlenmiş ve kontrol bölgesi arasındaki ortalama ELA farkı aralığı |
|---:|---:|---:|
| 20 | 0,853 | 9,074–10,737 |
| 80 | 0,957 | 5,231–5,781 |
| 95 | 0,877 | 1,320–1,773 |

Kalite 20, yapıştırma bölgesinin ortalama farkını daha fazla artırdı. Çevrede de daha büyük sıkıştırma farkları ürettiği için bilinen bölgeyi ayırma başarısı kalite 80'e göre düştü. Üç örnekte de ROC-AUC bakımından en iyi ayar 80'di. Kalite 95'te bölgenin ortalama farkı 1,605–2,046 aralığına indi.

Ayrıntılı ölçümlerde kontrol ve düzenlenmiş görüntüler için medyan işlem süreleri yaklaşık 40–70 ms aralığındadır. Ölçüm VMware Ubuntu konuk sisteminde, 4 sanal CPU ile, Python 3.11.18 ve OpenCV 5.1.0 kullanılarak alındı. [Ölçüm tablosu](evaluation.csv)

## Yorum ve sınırlar

Üç yerleşim aynı fotoğrafı ve aynı parçayı paylaşır. Sonuçlar bu kontrollü düzenekte parametrenin etkisini gösterir. Farklı kamera, JPEG kodlayıcı, içerik ve düzenleme türlerinde performansı ölçmek için bağımsız örnekler gerekir. ROC-AUC burada piksel düzeyindedir ve fotoğrafın manipüle edilmiş olma olasılığını vermez. Görüntü JPEG dışındaysa harita o girdinin JPEG'e dönüştürülmesinden kaynaklanan farkı gösterir.

## Yeniden çalıştırma ve sunum

Proje klasöründe `imagepr_env` etkin iken aşağıdaki komut ham ölçümleri yeni bir dosyaya yazar. İşlem süreleri donanım ve yükle değişebilir.

```bash
python -m image_spatter.evaluate /tmp/image-spatter-evaluation.csv
```

Uygulamayı [çalıştırma adımlarıyla](../README.md) aç. **Kontrol** ve **Kontrollü düzenleme** örneklerini sırayla seçip 80 ve 95'i karşılaştır. Ardından 20'yi deneyerek arka plandaki farkların nasıl değiştiğini göster. [Ders sunumu](presentation.html)

## Doğrulama

Ubuntu üzerinde Electron uygulamasının yerel dosya seçicisiyle bir PNG açıldı. Hazır JPEG örnekleri, kalite değişimi, üst üste gösterim ve yakınlaştırma uygulama penceresinde denendi. Python motoru ayrıca AVIF ve WebP dosyalarıyla, saydam bir PNG ve geçersiz girdilerle test edildi. Deney yeniden çalıştırıldığında süre dışındaki tüm ölçümler CSV ile eşleşti.

## V1 teslimi

| Kriter | Uygulama ve kanıt |
|---|---|
| Yerel görüntü açma | Electron dosya seçicisi ve iki hazır demo örneği |
| Python analizi | OpenCV ile bellekte JPEG yeniden sıkıştırma ve piksel farkı |
| Görselleştirme ve etkileşim | ELA haritaları, ortak ölçek, iki kalite, yakınlaştırma ve opaklık |
| Kontrollü değerlendirme | Üç eşleştirilmiş deney, üç kalite, ROI farkları, ROC-AUC ve medyan süre |
| Ders sunumu | Canlı demo akışı, uygulama görüntüsü ve ölçüm özeti |
