# Image Spatter — ilk notebook demosu

Görüntülerdeki JPEG yeniden sıkıştırma farklarını ELA (Error Level Analysis) ile inceleyen, adım adım açıklanmış bir ders demosu. Kod, önceki ders notebooklarındaki OpenCV / NumPy / Matplotlib yapısını izler.

## Ayrı sürümler

| Dosya | Ne için? |
|---|---|
| [Mevcut demo](Image_Spatter_Demo.ipynb) | Önceki notebook ve kişisel ayarların. |
| [V2 — Anlatımlı notebook](Image_Spatter_Demo_V2_Anlatimli.ipynb) | Her adımda ne yaptığımızı, neden yaptığımızı ve sonucu nasıl okuyacağını doğal bir dille anlatır. Türkçe metin içinde İngilizce terimler açıklanır. |
| [V3 — Sade anlatımlı HTML](Image_Spatter_V3_Sade_Anlatim.html) | Kod bilmeden okunabilir. Gerçek demo sonuçları arasında geçiş, kalite karşılaştırması, opaklık ayarı ve küçük bir sayı örneği içerir. |
| [V1 — Proje anlatımı](Image_Spatter_V1_Proje_Anlatimi.ipynb) | V1 planından hareketle amacımızı, nasıl yapacağımızı, değerlendirmeyi ve teslim hedeflerini basit dille anlatan kısa sunum notu. Temsili ekran ve çalışma akışı içerir. |
| [Compositor denemeleri](Image_Spatter_Compositor_Denemeleri.ipynb) | `duyuru.comp` ve `karga.comp` katmanlarından tam boyutlu PNG render'ları ve 5–95 aralığında ELA karşılaştırması. |
| [iremimg — kapsamlı çıktılar](data/iremimg/outputs/index.html) | 6 görselin bütün/sol/sağ görünümlerinde 144 analiz; JPEG, ELA, overlay, histogram, kenarlar, CSV ve ham diziler. [Kalite 20 dosyaları](data/iremimg/outputs/Q20/index.html) ayrıca toplandı. |

V2'yi proje klasöründe Jupyter ile aç. Bu sürüm örnek görüntüyle başlar; sonuçlarını `outputs/v2_anlatimli/` içine yazar. Önceki notebook'un ayarları ve sonuçları ayrı kalır.

V3'ü tarayıcıda açman yeterli. Görseller, stil ve etkileşimler HTML'in içinde; Python, internet veya ek dosya indirme gerektirmez. Düğmeler V2'de hesaplanan örnekler arasında geçiş yapar. Kendi görüntünü analiz etmek için V2'nin custom bölümünü kullan. Sürüm ayrıntıları [VERSIONS.md](VERSIONS.md) içinde.

V1 proje anlatımı, kod çalıştırmadan okunabilen ayrı bir notebook'tur. Tamamı açıklamalardan oluşur; iki temsili görsel dosyanın içine gömülüdür. Sonunda sunumda kullanılabilecek kısa bir konuşma metni bulunur. Buradaki V1, masaüstü uygulamasının hedef kapsamını ifade eder.

## Çalıştırma

Proje klasöründe, mevcut `imagepr_env` ortamını kullanabilirsin:

```bash
conda activate imagepr_env
python -m jupyterlab Image_Spatter_Demo.ipynb
```

Başka bir Python ortamında gerekli paketler:

```bash
python -m pip install -r requirements.txt
python -m jupyterlab Image_Spatter_Demo.ipynb
```

Notebook'ta hücreleri yukarıdan aşağıya çalıştır veya **Run All** seç. Her küçük işlemin hemen önünde ne yaptığını anlatan bir açıklama var. Kayıtlı grafikler notebook açıldığında da görülebilir.

## Demo içeriği

- `data/astronaut.png`: Çalışma alanında önceden bulunan ve ders notebookunda kullanılan örnek görüntünün kopyası. İnternetten indirilmez.
- Kontrollü deney: JPEG kalite 75 ile oluşturulan arka plana PNG kaynaktan bir arma eklenir. Kontrol ve düzenlenmiş örneklerin ikisi de son aşamada kalite 95 ile kaydedilir.
- ELA önce fonksiyonsuz gösterilir: JPEG olarak kaydet, geri oku, piksel farkını al, üç renk kanalının ortalamasını hesapla.
- Sonra aynı satırlar `calculate_ela` fonksiyonuna alınır. Fonksiyonun girdileri ve döndürdüğü sonuç açıklanır.
- Karşılaştırma: Kalite **5 / 10 / 20 / 40 / 60 / 80 / 90 / 95**; kontrol ve düzenlenmiş görüntülerde aynı alanın ortalama farkı; işlem süreleri. Çok düşük kalite aralığı da dahildir.
- **Custom image / Kendi görüntünü incele** bölümü, üstteki demo çalışmadan da kullanılabilir. Mevcut `custom_image_path` ve `custom_quality` ayarların korunur.

`outputs/` klasörüne kontrol ve düzenlenmiş JPEG'ler, bilinen maske, karşılaştırma grafikleri, `ela_overlay.png` ve `quality_comparison.csv` yazılır. `recompressed.jpg`, ELA için tekrar kullanılan çalışma dosyasıdır. Yeniden çalıştırma aynı adlı demo çıktılarını günceller. Görüntüler bir servise yüklenmez.

Kodda iç içe döngü, sözlük veya karmaşık tablo biçimlendirmesi yok. Görüntüden parça seçme, `mean(axis=2)`, `subplot`, `alpha`, fonksiyon ve döngü yazımı kullanıldığı yerde açıklanır.

## Custom image / Kendi görüntünü incele

Notebook'taki **8. Custom image** başlığından başlayıp o bölümün hücrelerini sırayla çalıştır. Türkçe açıklamaların yanında kısa İngilizce açıklamalar bulunur. Yeni ayarlarla tekrar denemek için bu bölümü baştan çalıştır.

```python
custom_image_path = "data/astronaut.png"  # Local file / Yerel dosya
custom_quality = 80
custom_display_max = 20                  # Color scale / Renk ölçeği
custom_overlay_alpha = 0.5               # Opacity / Opaklık
custom_qualities = [5, 10, 20, 40, 60, 80, 90, 95]
custom_roi = None                        # Optional: (x, y, width, height)
```

Input, ELA ve overlay yan yana gösterilir. Aynı görüntü farklı JPEG kalitelerinde, ortak renk ölçeğiyle karşılaştırılır. ROI, tam görüntüden hesaplanan ELA haritasının seçtiğin bölümünü yakından gösterir. Üstteki demoda üretilen `outputs/edited.jpg` dosyasında `(390, 40, 80, 80)` eklenen arma bölgesidir. Başka bir custom görüntüde seçilen kutu, kullanıcının seçimi olarak değerlendirilir.

Kaliteyi iyice düşürmek için **5, 10 ve 20**, ara karşılaştırmalar için **40 ve 60**, yüksek kalite için **80, 90 ve 95** kullanılır. Haritalar en fazla dört sütunla çizilir. Düşük kalitenin normal görüntü bölgelerinde de fark oluşturabildiği açıklanır. HTML'de seçilen ayarla yeniden kaydedilmiş gerçek JPEG kopyası da gösterilir; böylece fotoğraftaki kalite kaybı ve ELA haritası birlikte incelenebilir.

Pillow gerçek dosya formatını okur, EXIF yön bilgisini uygular ve saydam alanları gerektiğinde beyaz zeminle birleştirir. Analiz 8-bit renkli pikseller üzerinde, yeniden boyutlandırmadan yapılır. JPEG dışındaki bir girdide sonuç, girdinin JPEG'e çevrilme farkıdır.

Custom analiz JPEG'i bellekte oluşturup çözer; süreye dosya yükleme, çizim ve dışa aktarma dahil değildir. Üstteki öğretici demo ise adımları göstermek için diskte bir çalışma dosyası kullanmaya devam eder.

`custom_save_outputs = True` olduğunda `outputs/custom/<dosya_adı>/` altında her çalıştırma için yeni bir klasör açılır. Karşılaştırma ve heatmap PNG'leri, ham `ela_raw.npy`, kalite ölçümlerinin CSV'si ve kısa bir özet kaydedilir. ROI seçilmişse onun görseli ve CSV'si de eklenir. Önceki sonuçların ve giriş dosyasının üzerine yazılmaz. `custom_image_path = None` analizi atlar; `custom_save_outputs = False` dosya kaydetmeyi kapatır.

## ELA nedir? / What is ELA?

**Error Level Analysis / Hata Seviyesi Analizi**, giriş görüntüsüyle yeniden JPEG olarak sıkıştırılmış sürümünün piksel farklarını görselleştirir. Bu notebook her pikselde üç kanalın mutlak farklarının ortalamasını kullanır. Haritadaki parlaklık daha büyük fark anlamına gelir; sahte olma yüzdesi değildir. [Forensically'nin ELA açıklaması](https://29a.ch/photo-forensics/#error-level-analysis).

English: Recompress the input, compute absolute differences, and inspect the map. JPEG quality changes the measured differences; display max and overlay opacity change their appearance. ELA is a visual inspection aid, and this notebook does not produce an authenticity verdict.

## Yorumlama ve kapsam

ELA bir gerçek/sahte sınıflandırıcısı değildir. Doku, keskin kenarlar ve normal JPEG sıkıştırması da parlak bölgeler oluşturabilir. Maske, bizim oluşturduğumuz düzenlemenin bilinen konumudur; algoritmanın bulduğu bir bölge değildir. Ortalama farklar bir yüzde veya sahte olma olasılığı değildir.

Bu örnek, farklı sıkıştırma geçmişlerini özellikle oluşturur. Tek örnekten genel tespit başarısı çıkarılamaz. Grafikler aynı renk ölçeğini kullanır; ölçümler görüntüleme için kırpılmaz. Anlaşılır olması için JPEG dosyası diske yazılıp geri okunur. Ölçülen sürelere bu yazma ve okuma işlemleri dahildir; çizim dahil değildir.

Şimdiki teslim notebook demosudur. V1'deki Electron entegrasyonu ve daha geniş veriyle değerlendirme sonraki aşamadadır.
