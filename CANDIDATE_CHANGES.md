# Main candidate değişiklikleri

`main-candidate` aynı dalda iki kullanım biçimi sunar. [Jupyter notebook](Image_Spatter_Demo.ipynb) ELA hesabını adım adım öğretir ve ortak Python motoruyla örnekler çalıştırır. [Electron uygulaması](README.md#v1-masaüstü-uygulaması) aynı motoru yerel dosya seçimi ve etkileşimli karşılaştırma için kullanır.

## Eklenenler

| Aşama | Eklenen çalışma |
|---|---|
| Notebook birleştirmesi · `a2d956d` | İrem’in altı örneği ana demoya eklendi. Git’te bulunan görseller tekrar kullanıldı. Kişisel Mac dosya yolu, projeyle gelen örnek görüntüyle değiştirildi. |
| V1 akademik prototip · `372bfa6` | Electron arayüzü, yerel dosya seçimi ve iki JPEG kalitesi için ELA karşılaştırması eklendi. Üç kontrollü yerleşim ve üç kalite için dokuz ölçüm satırı, teknik rapor ve altı slaytlık çevrimdışı sunum hazırlandı. |
| Masaüstü 1.1 · `e7f8868` | Üç panelde birlikte yakınlaştırma ve kaydırma, klavye desteği ve ölçümleri içeren yerel PNG çıktısı eklendi. |
| Ortak motor | ELA hesabı `image_spatter/ela.py` altında toplandı. İki demo notebook’u elle yapılan hesapla motorun sonucunu piksel piksel karşılaştırır. İrem örnekleri ve akademik deney de motoru kullanır. `desktop/` arayüzü ve yerel dosya işlemlerini yönetir. |

## Değişiklik miktarı

| Karşılaştırma tabanı | Dosya | Eklenen satır | Silinen satır |
|---|---:|---:|---:|
| Orijinal `main` · `2d847f0` | 25 | 1.485 | 242 |
| Birleştirilmiş notebook aşaması · `a2d956d` | 24 | 1.394 | 152 |
| Masaüstü 1.1 · `e7f8868` | 10 | 109 | 193 |

Sayılar bu dosya hariç Git farkından alındı. Metin toplamı notebook JSON’u, dokümantasyon ve paket kilit dosyasını da kapsar. Orijinal `main` ile karşılaştırıldığında masaüstü ve Python motorunun 11 kaynak dosyası toplam 781 satır ekler. Uygulama ekran görüntüsü dosya sayısına dahildir.

## Giriş noktaları

- **Jupyter demosu** · Proje klasöründen `python -m jupyterlab Image_Spatter_Demo.ipynb` çalıştır ve **Run All** seç.
- **Python motoru** · `from image_spatter.ela import calculate_ela`. Fonksiyon bir OpenCV BGR görüntüsü ve JPEG kalitesi alır, ham ELA haritasını döndürür.
- **Etkileşimli masaüstü** · Proje klasöründen `npm --prefix desktop start` çalıştır. Electron ortak paketi bir yerel Python alt sürecinden çağırır.
- **Akademik deney** · `python -m image_spatter.evaluate /tmp/image-spatter-evaluation.csv`. [Teknik rapor](academic/REPORT.md) ölçütleri ve deneyin sınırlarını açıklar.
