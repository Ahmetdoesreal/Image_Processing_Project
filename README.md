# Image Spatter — ilk notebook demosu

Görüntülerdeki JPEG yeniden sıkıştırma farklarını ELA (Error Level Analysis) ile inceleyen, adım adım açıklanmış bir ders demosu. Kod, önceki ders notebooklarındaki OpenCV / NumPy / Matplotlib yapısını izler.

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
- Karşılaştırma: Kalite 80 / 90 / 95; kontrol ve düzenlenmiş görüntülerde aynı alanın ortalama farkı; işlem süreleri.
- Son hücrede `custom_image_path` ayarlanarak başka bir yerel görüntü incelenebilir.

`outputs/` klasörüne kontrol ve düzenlenmiş JPEG'ler, bilinen maske, karşılaştırma grafikleri, `ela_overlay.png` ve `quality_comparison.csv` yazılır. `recompressed.jpg`, ELA için tekrar kullanılan çalışma dosyasıdır. Yeniden çalıştırma aynı adlı demo çıktılarını günceller. Görüntüler bir servise yüklenmez.

Kodda iç içe döngü, sözlük veya karmaşık tablo biçimlendirmesi yok. Görüntüden parça seçme, `mean(axis=2)`, `subplot`, `alpha`, fonksiyon ve döngü yazımı kullanıldığı yerde açıklanır.

## Yorumlama ve kapsam

ELA bir gerçek/sahte sınıflandırıcısı değildir. Doku, keskin kenarlar ve normal JPEG sıkıştırması da parlak bölgeler oluşturabilir. Maske, bizim oluşturduğumuz düzenlemenin bilinen konumudur; algoritmanın bulduğu bir bölge değildir. Ortalama farklar bir yüzde veya sahte olma olasılığı değildir.

Bu örnek, farklı sıkıştırma geçmişlerini özellikle oluşturur. Tek örnekten genel tespit başarısı çıkarılamaz. Grafikler aynı renk ölçeğini kullanır; ölçümler görüntüleme için kırpılmaz. Anlaşılır olması için JPEG dosyası diske yazılıp geri okunur. Ölçülen sürelere bu yazma ve okuma işlemleri dahildir; çizim dahil değildir.

Şimdiki teslim notebook demosudur. V1'deki Electron entegrasyonu ve daha geniş veriyle değerlendirme sonraki aşamadadır.
