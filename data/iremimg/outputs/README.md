# iremimg analiz çıktıları

Başlangıç: [index.html](index.html). Kalite 20 dosyaları: [Q20/index.html](Q20/index.html). Notebook raporu: [Analiz_Raporu.ipynb](Analiz_Raporu.ipynb).

## İçerik

- 6 kaynak görsel; bütün/sol/sağ olmak üzere 18 görünüm.
- Her görünüm için 5, 10, 20, 40, 60, 80, 90, 95 kalitelerinde JPEG, ELA ve overlay: toplam 144 analiz.
- Her görünümde kaynak PNG, RGB/gri histogram, Canny kenarlar (100/200), Q20 RGB fark ×10, kalite karşılaştırma grafikleri, CSV ve ham ELA dizilerinin NPZ arşivi.
- Duyuru, karga ve error kontrol/render çiftlerinin tam boyutlu JPEG 20 sürümleri ve ayrı referans ölçümleri.

## Klasörler

```text
index.html                    Bütün çıktılara giriş
Q20/                          Kalite 20 için kolay erişim
images/01_.../report.html      Bir görselin ayrıntılı raporu
images/01_.../whole/           Bütün kolajın analizi
images/01_.../left/            Sol panelin bağımsız analizi
images/01_.../right/           Sağ panelin bağımsız analizi
reference_pairs_q20/          Önceki örneklerin Q20 sürümleri
all_measurements.csv          144 ölçüm satırı
analysis_manifest.json        Kaynaklar, parametreler, bütün ölçümler
Analiz_Raporu.ipynb            Kod çalıştırmadan okunabilen rapor
```

## Hesap

Dosyalar Pillow ile açıldı ve EXIF yön bilgisi uygulandı. RGB 8-bit pikseller analizden önce yeniden boyutlandırılmadı. Her kalite aynı girişten bağımsız olarak JPEG'e çevrildi. OpenCV mutlak kanal farkları alındı ve üç kanal float32 ortalamayla tek ELA değerine indirildi.

ELA PNG'lerinde ortak 0–20 renk ölçeği, overlay'de 0.55 opaklık kullanıldı. 20'yi aşan değerler aynı en parlak renkte gösterilir; ölçümler ve NPZ arşivleri kırpılmadı. NPZ anahtarları q05, q10, q20, q40, q60, q80, q90, q95. Q20 RGB fark ×10 yalnızca gösterim içindir.

Süre yalnızca JPEG encode, decode, mutlak fark ve kanal ortalamasını kapsar; giriş okuma, istatistik, çizim ve dosya kaydetme hariçtir.

## Yorumlama

İki AVIF ve iki WebP girdide ölçülen şey bu formatların JPEG'e dönüşüm farkıdır; önceki bir orijinal JPEG sıkıştırması kanıtlanmaz. Diğer iki dosyada JPEG yeniden sıkıştırması incelenir. Sol/sağ, konum bilgisidir; doğrulanmış orijinal/sahte etiketi değildir. Bilinen düzenleme maskesi yoktur, tespit doğruluğu hesaplanmadı.

Paneller görüntü genişliğinin ortasından ayrıldı; beyaz ayırıcı çizgiler kaldırılmadı. Her panelin ayrı JPEG'e çevrilmesi, bütün kolaj haritasından bir parçayı kesmekle aynı işlem değildir. Blok başlangıcı ve sınırlar değişebilir.

Mean/P95 gibi değerler piksel farklarını anlatır. display_clipped_percent, farkı 20'den büyük piksellerin oranıdır; manipüle edilmiş piksel oranı değildir. Histogram ve kenar haritası ek inceleme araçlarıdır; sahtecilik tespiti değildir. Görüntü içeriği ve farklı JPEG ayarları birlikte incelenmelidir.

## Referans çiftleri

Önceki duyuru, karga ve error kontrol/render PNG'leri değiştirilmeden okundu. Q20 JPEG'leri tam piksel boyutundadır. Referans ELA ve overlay dosyaları yalnızca gösterim için, analizden sonra en uzun kenarı 1280 olacak şekilde küçültüldü. Kaynak PNG'ler `.comp` katmanlarından ayrı bir birleştirmeyle oluşturulmuştu; native Compositor export'u olarak etiketlenmez.

## Okuma

Ana HTML ve alt raporlar yerel dosyalarla çalışır. Raporu başka yere taşırken bütün çıktı klasörünü birlikte kopyala. Notebook'un özet görselleri içine gömülüdür. Kaynak dosyaların kendileri değiştirilmedi.
