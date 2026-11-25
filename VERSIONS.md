# Image Spatter sürümleri

Bu klasörde deney sürümleri ve V1'in proje anlatımı ayrı dosyalarda tutulur. Yeni sürümler önceki notebook'un üzerine yazılmaz.

| Sürüm | Dosya | İçerik |
|---|---|---|
| Ana demo | [Image_Spatter_Demo.ipynb](Image_Spatter_Demo.ipynb) | Kontrollü ELA deneyi, kendi görüntünü inceleme ve İrem’in altı örneğini yeniden hesaplama. |
| V2 — Anlatımlı demo | [Image_Spatter_Demo_V2_Anlatimli.ipynb](Image_Spatter_Demo_V2_Anlatimli.ipynb) | Çalışan kod, kayıtlı grafikler ve her işlemin nedenini anlatan metin. |
| V3 — Günlük dille anlatım | [Image_Spatter_V3_Sade_Anlatim.html](Image_Spatter_V3_Sade_Anlatim.html) | Teknik bilgi gerektirmeyen, etkileşimli ve tek dosyalık açıklama. |
| V1 proje anlatımı | [Image_Spatter_V1_Proje_Anlatimi.ipynb](Image_Spatter_V1_Proje_Anlatimi.ipynb) | V1 Academic MVP planına dayalı, çoğunlukla sunumda okunabilecek sade açıklamalar ve temsili görseller. |
| Compositor örnekleri | [Image_Spatter_Compositor_Denemeleri.ipynb](Image_Spatter_Compositor_Denemeleri.ipynb) | İki `.comp` paketinin katmanlarından tam boyutlu PNG oluşturma ve kontrolle ELA karşılaştırması. |
| iremimg veri incelemesi | [HTML raporu](data/iremimg/outputs/index.html) · [Notebook](data/iremimg/outputs/Analiz_Raporu.ipynb) | 6 kaynağın bütün/sol/sağ görünümlerinde 144 ELA hesabı ve önceki örneklerin Q20 kopyaları. |

## iremimg çıktılarını inceleme

`data/iremimg/outputs/index.html` bütün raporlara giriş sayfasıdır. Her dosyada bütün/sol/sağ görünümü ve 5–95 arasında sekiz JPEG kalitesi seçilebilir. Kalite 20 dosyaları ayrıca `Q20/` klasörüne kondu; duyuru, karga ve error kontrol/render çiftlerinin JPEG 20 sürümleri de oradadır. Raporu başka yere taşırken HTML, CSS, JavaScript ve görsel dosyalarının bulunduğu bütün çıktı klasörünü birlikte kopyala.

Sol/sağ panel adları kaynakların doğrulanmış orijinal/sahte etiketleri değildir. Paneller bağımsız olarak yeniden JPEG'e kodlanır. JPEG dışı girdilerdeki ELA, o formatın JPEG'e dönüşüm farkını gösterir. Bu çıktı seti önceki notebook'ların ayarlarını değiştirmez.

## Compositor örneklerini inceleme

`outputs/compositor_tests/` içinde `duyuru_render.png` (2160 × 3840) ve `karga_render.png` (4284 × 5712) bulunur. Rapor notebook'u özet görselleri ve kalite tablolarını kendi içinde taşır. Ham ölçümler aynı klasördeki `ela_measurements.csv` dosyasındadır.

Bu iki paket, görünür Normal katmanlar ve saklanmış PNG içerikleri kullanır. Ayrı bir katman birleştirmesiyle render alınmıştır; Compositor uygulamasının kendi dışa aktarma motoru kullanılmamıştır. Konum, boyut, saydamlık, çevirme ve merkez etrafında dönüş uygulanır; yazıda paketin sakladığı bitmap kullanılır. Native render ile küçük yeniden örnekleme farkları olabilir.

ELA tam çözünürlükte, her kalite için aynı PNG girdiden hesaplanır. Bu PNG → JPEG farkıdır; özgün kamera JPEG'inin geçmişini doğrulamaz. Beyaz bölgeler üst katmanların manifestten bilinen kapsamıdır, otomatik tespit değildir.

## V1 proje anlatımını kullanma

Bu notebook, “Amacımız bu, şunları şöyle yapacağız” diye projeyi anlatmak içindir. Kod çalıştırmak gerekmez. Amaç, kullanıcı akışı, aday yöntemler, Electron–Python bağlantısı, test yaklaşımı, 7 haftalık plan ve tamamlanma ölçütlerini içerir. Sondaki kısa konuşma metni sunumda kullanılabilir.

Temsili ekran ve akış çizimi notebook'un içine gömülüdür. Ekran taslağı tamamlanmış Electron uygulaması olarak sunulmaz. ELA, mevcut ilk denemedir; nihai yöntem seçimi V1 planındaki gibi açık tutulur. Buradaki V1 uygulama kapsamının adıdır; V2/V3 deney anlatımlarının üzerine yazmaz.

## V2'yi kullanma

Notebook'u `Image_Processing_Project` klasöründe Jupyter ile aç ve hücreleri sırayla çalıştır. Kayıtlı grafikler çalıştırmadan da görülebilir.

Anlatım, görüntüyü açmaktan başlayıp parça eklemeyi, JPEG'i yeniden kaydetmeyi, piksel farklarını hesaplamayı ve sonucu yorumlamayı birlikte takip eder. Türkçe metin içinde ELA, overlay, ROI ve quality gibi İngilizce terimler açıklanır.

Bu sürümün ana demo çıktıları `outputs/v2_anlatimli/` içine, custom sonuçları da onun `custom/` alt klasörüne yazılır. Custom bölümünün başlangıç dosyası `data/astronaut.png` olur. Düzenlenmiş örneği denemek için `outputs/v2_anlatimli/edited.jpg` seçilebilir.

## V3'ü kullanma

HTML dosyasını tarayıcıda aç. Fotoğraf, fark haritaları, renkler ve etkileşimler dosyanın içindedir. Tek dosyayı paylaşabilir ve internetsiz okuyabilirsin. Jupyter veya Python çalıştırmak gerekmez.

Sayfada iki demo örneğini **5, 10, 20, 40, 60, 80, 90 ve 95** kalite ayarlarında karşılaştırabilir, haritanın fotoğraf üzerindeki opaklığını değiştirebilir, piksel farkının mantığını küçük bir sayı örneğinde deneyebilirsin. Çok düşük kalite değerlerinde yeniden kaydedilen JPEG kopyası da gösterilir. Hazır haritalar V2'nin gerçek hesaplarından gelir; HTML yeni bir dosyaya analiz uygulamaz.

ELA'nın ne gösterdiği ve yorumlama sınırları da günlük dille açıklanır. Kutu bizim bildiğimiz düzenleme konumudur; otomatik tespit değildir. Sayılar piksel farklarıdır; sahte olma yüzdesi değildir.
