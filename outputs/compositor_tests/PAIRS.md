# Kontrol ve render dosyaları

Kontrol, paketteki arka plan katmanıdır. Render, görünür katmanların birleştirilmiş halidir. Dosyalar PNG olarak, yeniden boyutlandırmadan kaydedildi.

| Örnek | Boyut | Kontrol | Render |
|---|---|---|---|
| duyuru | 2160 × 3840 | [duyuru_control.png](duyuru_control.png) | [duyuru_render.png](duyuru_render.png) |
| karga | 4284 × 5712 | [karga_control.png](karga_control.png) | [karga_render.png](karga_render.png) |
| error | 387 × 130 | [error_control.png](error_control.png) | [error_render.png](error_render.png) |

`error_render.png` metin katmanını ve gölgesini içerir. Arka plan dosyaları özgünlüğü doğrulanmış kamera fotoğrafı olarak etiketlenmez; kontrolün anlamı ek katmanların uygulanmamış olmasıdır.

Render, paket içindeki bitmap katmanlarından ayrı bir birleştirmeyle alınır; uygulamanın native export motoru çalıştırılmaz. Dönüşüm örneklemesi ve Gaussian gölge hesabında native çıktıdan küçük piksel farkları olabilir. Kaynak `.comp` paketleri değiştirilmedi. Önceki ELA raporu duyuru ve karga için yapılan denemeyi anlatmaya devam eder; bu işlem error için yeni bir ELA ölçümü eklemez.
