/* Màu dùng để vẽ hình ly minh hoạ: mã màu -> [màu, nhãn]. Món mới dùng mã chưa có thì thêm vào đây. */
export const PALETTE = {
  "coffee": ["#3b2216", "Cà phê"], "espresso": ["#4a2715", "Espresso"], "coldbrew": ["#43230f", "Cold brew"],
  "condensed": ["#efe0c2", "Sữa đặc"], "milk": ["#f6f1ea", "Sữa"], "cream": ["#f4e8d3", "Sữa cream"],
  "sugar": ["#e9c88f", "Đường"], "water": ["#dcebf2", "Nước"], "ice": ["#dff0f7", "Đá viên"], "powder": ["#efe9df", "Bột"],
  "cafe-sua": ["#a8724a", "Cà phê + sữa đặc (đánh bọt)"], "latte": ["#c79a72", "Sữa + espresso"], "americano": ["#5a3420", "Espresso + nước"],
  "tea-oolong": ["#cf8f3e", "Trà olong"], "tea-earl": ["#a25330", "Trà bá tước"], "milktea": ["#c9a17a", "Trà sữa bá tước"],
  "genmai-milk": ["#d8bd93", "Trà sữa gạo rang"], "oolong-milk": ["#c69b6d", "Trà sữa olong"],
  "matcha": ["#7aa140", "Matcha"], "matcha-milk": ["#b7d08b", "Sữa matcha"], "houjicha": ["#94532e", "Houjicha"],
  "choco": ["#5b311d", "Chocolate"], "choco-milk": ["#8c5a3b", "Sữa chocolate"], "genmai": ["#cdb07a", "Bột genmaicha"],
  "mango": ["#f3b02c", "Xoài"], "mango-cube": ["#f7b733", "Xoài tươi"], "strawberry": ["#e0475a", "Dâu"], "guava": ["#f08e8a", "Ổi"],
  "peach": ["#f6a57c", "Đào"], "lychee": ["#f3dadd", "Vải"], "melon": ["#c8e08b", "Dưa lưới"], "orange": ["#f49a2a", "Cam"],
  "apricot": ["#f2a33f", "Mơ"], "apricot-cherry": ["#b8323a", "Mứt mơ anh đào"], "cinnamon": ["#a0522d", "Syrup quế"],
  "lemon": ["#f2e27a", "Nước chanh"], "yuzu": ["#f4d24a", "Yuzu"],
  "berry-tea": ["#c14b3a", "Trà bá tước + dâu + ổi"], "peach-tea": ["#e48a45", "Trà olong + đào + mơ + cam"],
  "lychee-tea": ["#e9b98e", "Trà olong + vải hồng + dưa lưới"], "mango-tea": ["#eaa13a", "Trà olong + xoài"],
  "cherry-coldbrew": ["#5e2018", "Cold brew + mơ anh đào + quế"], "mango-coldbrew": ["#6b3a14", "Cold brew + xoài"],
  "guava-snow": ["#f6b6b1", "Tuyết ổi (xay mịn)"],
  "foam": ["#fffaf0", "Milk foam"], "foam-cheese": ["#fcefc6", "Milk foam cheese"], "foam-coconut": ["#fbf7ec", "Milk foam dừa"],
  "foam-chestnut": ["#e9d1b3", "Milk foam hạt dẻ"], "foam-yogurt": ["#fff4ec", "Foam yogurt"],
  "pearl": ["#2b1a14", "Trân châu"], "glass-pearl": ["#f4d3de", "Hạt thủy tinh"], "jelly-peach": ["#f7b48c", "Thạch đào"],
  "jelly-lychee": ["#f4ebe2", "Thạch vải"], "jelly-houjicha": ["#8b5636", "Thạch houjicha"], "redbean": ["#6e2b27", "Đậu đỏ"],
  "lotus-seed": ["#efe3c5", "Sen lon"], "avocado": ["#9fbd4f", "Bơ xay"], "almond-milk": ["#efe2cc", "Sữa hạnh nhân + cream"],
  "almond": ["#e7c89a", "Hạnh nhân lát"], "frappe-mocha": ["#7b4d33", "Mocha xay"], "frappe-genmai": ["#dbc59b", "Genmaicha xay"],
  "cereal": ["#d49a4a", "Ngũ cốc"], "yogurt": ["#fbf6f0", "Sữa chua"], "yogurt-mango": ["#f6c565", "Yogurt xoài (shake)"],
  "yogurt-berry": ["#f19fad", "Yogurt dâu (shake)"], "yogurt-yuzu": ["#f6dc86", "Yogurt yuzu (shake)"],
  "decor": ["#5d9b48", "Decor"], "dust-choco": ["#5b311d", "Bột chocolate"], "dust-genmai": ["#cdb07a", "Bột genmaicha"]
};

/* Các lớp vẽ thành hạt/miếng thay vì một mảng màu. */
export const PARTICLE = { "pearl": 1, "glass-pearl": 1, "jelly-peach": 1, "jelly-lychee": 1, "jelly-houjicha": 1, "redbean": 1, "lotus-seed": 1, "mango-cube": 1, "cereal": 1 };

export const colorOf = (k) => (PALETTE[k] || ["#ccc"])[0];
