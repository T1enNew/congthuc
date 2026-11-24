/*
 * Dữ liệu công thức — chép từ "Cẩm nang thức uống Last Minute Cafe" (PDF).
 * Muốn sửa định lượng / thêm món: sửa trực tiếp file này.
 *
 * Quy ước:
 *  - sizes: ["M"], ["M","L"], ["L"] hoặc null (tài liệu không ghi size)
 *  - q: số lượng. Có size -> {M: .., L: ..}; không size -> số/chuỗi
 *  - k: mã màu dùng để vẽ hình ly minh hoạ (xem PALETTE trong app.js)
 *  - p: id bán thành phẩm liên quan (nếu có)
 *  - cup.layers: các lớp trong ly, từ ĐÁY lên MIỆNG ly: [mã màu, lượng]
 */
window.MENU = {
  source: "Cẩm nang thức uống Last Minute Cafe",

  categories: [
    { id: "truyen-thong", name: "Cà phê truyền thống", short: "Truyền thống" },
    { id: "espresso", name: "Cà phê Espresso", short: "Espresso" },
    { id: "cold-brew", name: "Cold Brew", short: "Cold Brew" },
    { id: "tra-trai-cay", name: "Trà trái cây – Trà milk foam", short: "Trà trái cây" },
    { id: "tra-sua", name: "Trà sữa milk foam", short: "Trà sữa" },
    { id: "matcha", name: "Matcha", short: "Matcha" },
    { id: "houjicha", name: "Houjicha", short: "Houjicha" },
    { id: "chocolate", name: "Chocolate", short: "Chocolate" },
    { id: "da-xay", name: "Smoothie – Đá xay", short: "Đá xay" },
    { id: "yogurt", name: "Yogurt Ice", short: "Yogurt" }
  ],

  drinks: [
    /* ───────── CÀ PHÊ TRUYỀN THỐNG ───────── */
    {
      id: "ca-phe-den-nong", name: "Cà phê đen nóng", cat: "truyen-thong", temp: "hot", sizes: ["M"],
      aka: ["đen nóng", "cafe đen nóng", "black coffee"],
      ing: [
        { n: "An Viên coffee", u: "ml", q: { M: 80 }, k: "coffee" },
        { n: "Đường nâu gói", u: "gói", q: { M: 1 }, side: true }
      ],
      pack: ["Tách cam lớn", "Dĩa cam lớn", "Muỗng nhỏ"],
      steps: ["Làm nóng tách", "Chiết cà phê trực tiếp ra tách", "Chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      cup: { type: "hot", vessel: "tach-lon", layers: [["coffee", 80]], top: "crema" }
    },
    {
      id: "ca-phe-den-da", name: "Cà phê đen đá", cat: "truyen-thong", temp: "ice", sizes: ["M", "L"],
      aka: ["đen đá", "cafe đen đá", "cf đen"],
      ing: [
        { n: "An Viên coffee", u: "ml", q: { M: 60, L: 80 }, k: "coffee" },
        { n: "Đường nước", u: "ml", q: { M: 10, L: 20 }, k: "sugar" },
        { n: "Đá viên", u: "gram", q: { M: 150, L: 200 }, k: "ice" }
      ],
      pack: { M: ["Ly 14oz", "Nắp bằng", "Ống phi 6"], L: ["Ly 16oz", "Nắp bằng", "Ống phi 6"] },
      steps: ["Chiết cà phê, cho đường và cà phê vào ly", "Đánh tạo bọt, cho đá vào ly", "Đậy nắp, chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      cup: { type: "ice", lid: "flat", layers: [["coffee", 90]], foamTop: "coffee-foam", ice: true }
    },
    {
      id: "ca-phe-sua-nong", name: "Cà phê sữa nóng", cat: "truyen-thong", temp: "hot", sizes: ["M"],
      aka: ["sữa nóng", "nâu nóng", "cafe sữa nóng"],
      ing: [
        { n: "An Viên coffee", u: "ml", q: { M: 80 }, k: "coffee" },
        { n: "Sữa đặc", u: "ml", q: { M: 40 }, k: "condensed" }
      ],
      pack: ["Tách cam lớn", "Dĩa cam lớn", "Muỗng nhỏ"],
      steps: ["Làm nóng tách", "Cho sữa vào tách", "Chiết cà phê trực tiếp ra tách", "Chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      cup: { type: "hot", vessel: "tach-lon", layers: [["condensed", 40], ["coffee", 80]], top: "crema" }
    },
    {
      id: "ca-phe-sua-da", name: "Cà phê sữa đá", cat: "truyen-thong", temp: "ice", sizes: ["M", "L"],
      aka: ["sữa đá", "nâu đá", "cafe sữa đá", "cfsd"],
      ing: [
        { n: "An Viên coffee", u: "ml", q: { M: 60, L: 80 }, k: "coffee" },
        { n: "Sữa đặc", u: "ml", q: { M: 30, L: 40 }, k: "condensed" },
        { n: "Đá viên", u: "gram", q: { M: 150, L: 200 }, k: "ice" }
      ],
      pack: { M: ["Ly 14oz", "Nắp bằng", "Ống phi 6"], L: ["Ly 16oz", "Nắp bằng", "Ống phi 6"] },
      steps: ["Chiết cà phê, cho sữa đặc và cà phê vào ly", "Đánh tạo bọt, cho đá vào ly", "Đậy nắp, chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      cup: { type: "ice", lid: "flat", layers: [["cafe-sua", 100]], foamTop: "coffee-foam", ice: true }
    },
    {
      id: "creamfee-nong", name: "Creamfee nóng", cat: "truyen-thong", temp: "hot", sizes: ["M"],
      aka: ["creamfee", "cream fee", "cà phê kem nóng"],
      ing: [
        { n: "An Viên coffee", u: "ml", q: { M: 60 }, k: "coffee" },
        { n: "Sữa cream", u: "ml", q: { M: 120 }, k: "cream" }
      ],
      pack: ["Tách cam lớn", "Dĩa cam lớn", "Muỗng nhỏ"],
      steps: ["Làm nóng tách", "Cho sữa vào ca đong đánh nóng và đổ ra tách", "Chiết cà phê trực tiếp ra tách", "Chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      cup: { type: "hot", vessel: "tach-lon", layers: [["cream", 120], ["coffee", 60]] }
    },
    {
      id: "creamfee-da", name: "Creamfee đá", cat: "truyen-thong", temp: "ice", sizes: ["M", "L"],
      aka: ["creamfee", "cream fee đá", "cà phê kem đá"],
      ing: [
        { n: "Sữa cream", u: "ml", q: { M: 100, L: 120 }, k: "cream" },
        { n: "An Viên coffee", u: "ml", q: { M: 30, L: 60 }, k: "coffee" },
        { n: "Đá viên", u: "gram", q: { M: 150, L: 200 }, k: "ice" }
      ],
      pack: { M: ["Ly 14oz", "Nắp bằng", "Ống phi 6"], L: ["Ly 16oz", "Nắp bằng", "Ống phi 6"] },
      steps: ["Cho sữa vào ly đánh tạo bọt", "Cho đá vào ly, đổ cà phê lên trên", "Đậy nắp, chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      cup: { type: "ice", lid: "flat", layers: [["cream", 110], ["coffee", 45]], ice: true }
    },
    {
      id: "ca-phe-milk-foam-muoi", name: "Cà phê milk foam muối", cat: "truyen-thong", temp: "ice", sizes: ["L"],
      aka: ["cà phê muối", "cafe muối", "kem muối", "salt coffee"],
      ing: [
        { n: "An Viên coffee", u: "ml", q: { L: 60 }, k: "coffee" },
        { n: "Sữa đặc", u: "ml", q: { L: 40 }, k: "condensed" },
        { n: "Đá viên", u: "gram", q: { L: 200 }, k: "ice" },
        { n: "Milk foam nguyên vị", u: "gram", q: { L: 40 }, k: "foam", p: "milk-foam-muoi" },
        { n: "Bột chocolate", u: "gram", q: { L: "0,1" }, k: "dust-choco" }
      ],
      pack: ["Ly 16oz", "Nắp cầu", "Ống phi 6"],
      steps: ["Chiết cà phê, cho sữa đặc và cà phê vào ly", "Đánh tạo bọt, cho đá vào ly", "Cho lớp macchiato (milk foam) lên trên, rắc bột chocolate", "Đậy nắp, chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      notes: ["Tài liệu ghi thành phần là “Milk foam nguyên vị”, trong khi phần bán thành phẩm có “Milk foam muối”. Hỏi lại quản lý để dùng đúng loại foam."],
      cup: { type: "ice", lid: "dome", layers: [["cafe-sua", 100], ["foam", 40]], ice: true, dust: "choco" }
    },
    {
      id: "ca-phe-milk-foam-dua", name: "Cà phê milk foam dừa", cat: "truyen-thong", temp: "ice", sizes: ["L"],
      aka: ["cà phê dừa", "cafe dừa", "coconut coffee"],
      ing: [
        { n: "An Viên coffee", u: "ml", q: { L: 60 }, k: "coffee" },
        { n: "Sữa đặc", u: "ml", q: { L: 40 }, k: "condensed" },
        { n: "Đá viên", u: "gram", q: { L: 200 }, k: "ice" },
        { n: "Milk foam dừa", u: "gram", q: { L: 40 }, k: "foam-coconut", p: "milk-foam-dua" },
        { n: "Bột chocolate", u: "gram", q: { L: "0,1" }, k: "dust-choco" }
      ],
      pack: ["Ly 16oz", "Nắp cầu", "Ống phi 6"],
      steps: ["Chiết cà phê, cho sữa đặc và cà phê vào ly", "Đánh tạo bọt, cho đá vào ly", "Cho lớp macchiato (milk foam dừa) lên trên, rắc bột chocolate", "Đậy nắp, chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      cup: { type: "ice", lid: "dome", layers: [["cafe-sua", 100], ["foam-coconut", 40]], ice: true, dust: "choco" }
    },

    /* ───────── CÀ PHÊ ESPRESSO ───────── */
    {
      id: "espresso", name: "Espresso", cat: "espresso", temp: "hot", sizes: null,
      aka: ["expresso", "shot"],
      ing: [
        { n: "Arabica", u: "double shot (60 ml)", q: 1, k: "espresso" },
        { n: "Đường nâu gói", u: "gói", q: 1, side: true }
      ],
      pack: ["Tách cam nhỏ", "Dĩa cam nhỏ", "Muỗng nhỏ"],
      steps: ["Làm nóng tách", "Chiết cà phê trực tiếp ra tách", "Chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      cup: { type: "hot", vessel: "tach-nho", layers: [["espresso", 60]], top: "crema" }
    },
    {
      id: "cappuccino-nong", name: "Cappuccino nóng", cat: "espresso", temp: "hot", sizes: null,
      aka: ["cappuchino", "capuchino", "cappu"],
      ing: [
        { n: "Arabica", u: "double shot (60 ml)", q: 1, k: "espresso" },
        { n: "Sữa thanh trùng", u: "ml", q: 200, k: "milk" },
        { n: "Đường nâu gói", u: "gói", q: 1, side: true }
      ],
      pack: ["Tách cam lớn", "Dĩa cam lớn", "Muỗng nhỏ"],
      steps: ["Chiết cà phê ra tách", "Làm lạnh ca đánh sữa, cho sữa vào", "Đánh sữa foam cappuccino (foam dày) và tạo hình (art)", "Chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      cup: { type: "hot", vessel: "tach-lon", layers: [["espresso", 60], ["latte", 90], ["foam", 70]], top: "art" }
    },
    {
      id: "latte-nong", name: "Latte nóng", cat: "espresso", temp: "hot", sizes: null,
      aka: ["latte", "cafe latte", "caffe latte"],
      ing: [
        { n: "Arabica", u: "double shot (60 ml)", q: 1, k: "espresso" },
        { n: "Sữa thanh trùng", u: "ml", q: 200, k: "milk" },
        { n: "Đường nâu gói", u: "gói", q: 1, side: true }
      ],
      pack: ["Tách cam lớn", "Dĩa cam lớn", "Muỗng nhỏ"],
      steps: ["Chiết cà phê ra tách", "Làm lạnh ca đánh sữa, cho sữa vào", "Đánh sữa foam latte (foam mỏng) và tạo hình (art)", "Chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      cup: { type: "hot", vessel: "tach-lon", layers: [["espresso", 60], ["latte", 150], ["foam", 30]], top: "art" }
    },
    {
      id: "latte-da", name: "Latte đá", cat: "espresso", temp: "ice", sizes: null,
      aka: ["iced latte", "latte lạnh"],
      ing: [
        { n: "Arabica", u: "double shot (60 ml)", q: 1, k: "espresso" },
        { n: "Sữa thanh trùng", u: "ml", q: 150, k: "milk" },
        { n: "Đá viên", u: "gram", q: 200, k: "ice" }
      ],
      pack: ["Ly 16oz", "Nắp bằng", "Ống phi 6"],
      steps: ["Chiết xuất cà phê", "Cho lần lượt sữa và đá vào ly", "Cho cà phê lên trên", "Đậy nắp, chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      cup: { type: "ice", lid: "flat", layers: [["milk", 150], ["espresso", 60]], ice: true }
    },
    {
      id: "americano-nong", name: "Americano nóng", cat: "espresso", temp: "hot", sizes: null,
      aka: ["americano", "cafe mỹ"],
      ing: [
        { n: "Arabica", u: "double shot (60 ml)", q: 1, k: "espresso" },
        { n: "Nước nóng", u: "ml", q: 150, k: "water" },
        { n: "Đường nâu gói", u: "gói", q: 1, side: true }
      ],
      pack: ["Tách cam lớn", "Dĩa cam lớn", "Muỗng nhỏ"],
      steps: ["Cho nước nóng vào tách", "Chiết cà phê trực tiếp vào tách", "Chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      cup: { type: "hot", vessel: "tach-lon", layers: [["americano", 210]], top: "crema" }
    },
    {
      id: "americano-da", name: "Americano đá", cat: "espresso", temp: "ice", sizes: null,
      aka: ["iced americano", "americano lạnh"],
      ing: [
        { n: "Arabica", u: "double shot (60 ml)", q: 1, k: "espresso" },
        { n: "Nước lọc", u: "ml", q: 150, k: "water" },
        { n: "Đá viên", u: "gram", q: 200, k: "ice" }
      ],
      pack: ["Ly 16oz", "Nắp bằng", "Ống phi 6"],
      steps: ["Chiết xuất cà phê cho vào ly", "Cho lần lượt đá và nước lọc vào ly", "Đậy nắp, chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      cup: { type: "ice", lid: "flat", layers: [["americano", 210]], ice: true }
    },

    /* ───────── COLD BREW ───────── */
    {
      id: "cold-brew-nguyen-vi", name: "Cold brew nguyên vị", cat: "cold-brew", temp: "ice", sizes: null,
      aka: ["cold brew", "coldbrew", "ủ lạnh"],
      ing: [
        { n: "Cold brew", u: "ml", q: 100, k: "coldbrew", p: "nen-cold-brew" },
        { n: "Đá viên", u: "gram", q: 200, k: "ice" },
        { n: "Cam sấy + húng lũi (decor)", u: "cái", q: 1, k: "decor" }
      ],
      pack: ["Ly 14oz", "Nắp cầu", "Ống phi 6"],
      steps: ["Cho cold brew vào ly", "Cho đá vào ly và decor", "Đậy nắp, chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      cup: { type: "ice", lid: "dome", layers: [["coldbrew", 100]], ice: true, decor: true }
    },
    {
      id: "cold-brew-mo-anh-dao", name: "Cold brew mơ anh đào", cat: "cold-brew", temp: "ice", sizes: null,
      aka: ["cold brew mơ", "cold brew anh đào", "cold brew quế"],
      ing: [
        { n: "Cold brew", u: "ml", q: 100, k: "coldbrew", p: "nen-cold-brew" },
        { n: "Đường nước", u: "ml", q: 10, k: "sugar" },
        { n: "Syrup quế", u: "ml", q: 10, k: "cinnamon" },
        { n: "Mứt mơ anh đào", u: "ml", q: 20, k: "apricot-cherry" },
        { n: "Đá viên", u: "gram", q: 150, k: "ice" },
        { n: "Cam sấy + húng lũi (decor)", u: "cái", q: 1, k: "decor" }
      ],
      pack: ["Ly 14oz", "Nắp cầu", "Ống phi 6"],
      steps: ["Cho lần lượt đường, syrup, mứt vào shaker", "Cho cold brew và đá vào shaker", "Shake đều tay 5 giây, cho ra ly và decor", "Đậy nắp, chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      cup: { type: "ice", lid: "dome", layers: [["cherry-coldbrew", 140]], foamTop: "shake-foam", ice: true, decor: true }
    },
    {
      id: "cold-brew-xoai-foam-dua", name: "Cold brew xoài foam dừa", cat: "cold-brew", temp: "ice", sizes: null,
      aka: ["cold brew xoài", "cold brew dừa"],
      ing: [
        { n: "Cold brew", u: "ml", q: 100, k: "coldbrew", p: "nen-cold-brew" },
        { n: "Đường nước", u: "ml", q: 10, k: "sugar" },
        { n: "Nước cốt xoài", u: "ml", q: 20, k: "mango" },
        { n: "Milk foam dừa", u: "gram", q: 40, k: "foam-coconut", p: "milk-foam-dua" },
        { n: "Đá viên", u: "gram", q: 150, k: "ice" },
        { n: "Cam sấy + húng lũi (decor)", u: "cái", q: 1, k: "decor" }
      ],
      pack: ["Ly 14oz", "Nắp cầu", "Ống phi 6"],
      steps: ["Cho lần lượt đường, xoài, cold brew vào ly", "Khuấy đều và cho đá vào ly", "Cho milk foam dừa lên trên và decor", "Đậy nắp, chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      cup: { type: "ice", lid: "dome", layers: [["mango-coldbrew", 130], ["foam-coconut", 40]], ice: true, decor: true }
    },
    {
      id: "cold-brew-tuyet-oi", name: "Cold brew tuyết ổi", cat: "cold-brew", temp: "blend", sizes: null,
      aka: ["cold brew ổi", "tuyết ổi"],
      ing: [
        { n: "Cold brew", u: "ml", q: 100, k: "coldbrew", p: "nen-cold-brew" },
        { n: "Đường nước", u: "ml", q: 10, k: "sugar" },
        { n: "Nước lọc", u: "ml", q: 50, k: "water" },
        { n: "Nước cốt ổi", u: "ml", q: 50, k: "guava" },
        { n: "Bột đá xay không sữa", u: "ml", q: 10, k: "powder" },
        { n: "Đá viên", u: "ml", q: 200, k: "ice" },
        { n: "Cam sấy + húng lũi (decor)", u: "cái", q: 1, k: "decor" }
      ],
      pack: ["Ly 14oz", "Nắp cầu", "Ống phi 6"],
      steps: ["Cho cold brew vào ly", "Cho đường, nước lọc, nước ổi, bột, đá vào cối xay. Xay mịn hỗn hợp", "Cho hỗn hợp ra ly (phủ lên cold brew) và decor", "Đậy nắp, chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      notes: ["Tài liệu ghi đơn vị của bột đá xay và đá viên là “ml” — giữ nguyên theo tài liệu, cân theo dụng cụ quán đang dùng."],
      cup: { type: "ice", lid: "dome", layers: [["coldbrew", 100], ["guava-snow", 150]], decor: true, slush: true }
    },

    /* ───────── TRÀ TRÁI CÂY – TRÀ MILK FOAM ───────── */
    {
      id: "tra-ba-tuoc-dau-oi", name: "Trà bá tước dâu ổi", cat: "tra-trai-cay", temp: "ice", sizes: null,
      aka: ["trà dâu ổi", "earl grey dâu", "bá tước dâu"],
      ing: [
        { n: "Đường nước", u: "ml", q: 10, k: "sugar" },
        { n: "Nền nước chanh", u: "ml", q: 10, k: "lemon", p: "nen-nuoc-chanh" },
        { n: "Nước cốt ổi", u: "ml", q: 20, k: "guava" },
        { n: "Mứt dâu", u: "ml", q: 20, k: "strawberry" },
        { n: "Nền trà bá tước", u: "ml", q: 120, k: "tea-earl", p: "nen-tra-ba-tuoc" },
        { n: "Đá viên", u: "gram", q: 250, k: "ice" },
        { n: "Hạt thủy tinh", u: "gram", q: 50, k: "glass-pearl" },
        { n: "Cam sấy + húng lũi (decor)", u: "cái", q: 1, k: "decor" }
      ],
      pack: ["Ly 20oz", "Nắp cầu", "Ống phi 12", "Muỗng nhựa"],
      steps: ["Cho lần lượt các nguyên liệu theo thứ tự trên và ½ đá vào ly, shake đều tay", "Cho hỗn hợp ra ly, thêm vài viên đá, cách miệng ly 2 cm", "Cho topping lên trên và decor", "Đậy nắp, chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      cup: { type: "ice", lid: "dome", layers: [["berry-tea", 180], ["glass-pearl", 50]], ice: true, decor: true }
    },
    {
      id: "olong-mo-cam-dao", name: "Olong mơ cam đào", cat: "tra-trai-cay", temp: "ice", sizes: null,
      aka: ["trà đào", "olong đào", "oolong đào cam"],
      ing: [
        { n: "Cam vàng", u: "lát", q: 1, k: "orange" },
        { n: "Đào miếng", u: "miếng", q: 1, k: "peach" },
        { n: "Đường nước", u: "ml", q: 10, k: "sugar" },
        { n: "Mứt đào hồng", u: "ml", q: 20, k: "peach" },
        { n: "Mứt mơ", u: "ml", q: 20, k: "apricot" },
        { n: "Nước cam", u: "ml", q: 30, k: "orange" },
        { n: "Nền trà olong", u: "ml", q: 120, k: "tea-oolong", p: "nen-tra-olong" },
        { n: "Đá viên", u: "gram", q: 250, k: "ice" },
        { n: "Thạch đào", u: "gram", q: 50, k: "jelly-peach", p: "thach-dao" },
        { n: "Cam sấy + húng lũi (decor)", u: "cái", q: 1, k: "decor" }
      ],
      pack: ["Ly 20oz", "Nắp cầu", "Ống phi 12", "Muỗng nhựa"],
      steps: ["Cho lần lượt các nguyên liệu theo thứ tự trên và ½ đá vào ly, shake đều tay", "Cho hỗn hợp ra ly, thêm vài viên đá, cách miệng ly 2 cm", "Cho topping lên trên và decor", "Đậy nắp, chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      cup: { type: "ice", lid: "dome", layers: [["peach-tea", 200], ["jelly-peach", 50]], ice: true, decor: true, fruit: "peach" }
    },
    {
      id: "olong-vai-hong-dua-luoi", name: "Olong vải hồng dưa lưới", cat: "tra-trai-cay", temp: "ice", sizes: null,
      aka: ["trà vải hồng", "olong dưa lưới", "vải hoa hồng"],
      ing: [
        { n: "Đường nước", u: "ml", q: 10, k: "sugar" },
        { n: "Syrup dưa lưới", u: "ml", q: 20, k: "melon" },
        { n: "Mứt vải hoa hồng", u: "ml", q: 20, k: "lychee" },
        { n: "Nền trà olong", u: "ml", q: 120, k: "tea-oolong", p: "nen-tra-olong" },
        { n: "Đá viên", u: "gram", q: 250, k: "ice" },
        { n: "Thạch vải", u: "gram", q: 30, k: "jelly-lychee", p: "thach-vai" },
        { n: "Cam sấy + húng lũi (decor)", u: "cái", q: 1, k: "decor" }
      ],
      pack: ["Ly 20oz", "Nắp cầu", "Ống phi 12", "Muỗng nhựa"],
      steps: ["Cho lần lượt các nguyên liệu theo thứ tự trên và ½ đá vào ly, shake đều tay", "Cho hỗn hợp ra ly, thêm vài viên đá, cách miệng ly 2 cm", "Cho topping lên trên và decor", "Đậy nắp, chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      notes: ["Tài liệu ghi đơn vị Đường nước là “Lát” và Syrup dưa lưới là “Miếng”. Nhiều khả năng là lỗi soạn thảo — trang này dùng ml như các món cùng nhóm."],
      cup: { type: "ice", lid: "dome", layers: [["lychee-tea", 170], ["jelly-lychee", 30]], ice: true, decor: true }
    },
    {
      id: "olong-vai-xoai", name: "Olong vải xoài", cat: "tra-trai-cay", temp: "ice", sizes: null,
      aka: ["trà vải xoài", "olong xoài vải"],
      ing: [
        { n: "Đường nước", u: "ml", q: 10, k: "sugar" },
        { n: "Syrup vải", u: "ml", q: 10, k: "lychee" },
        { n: "Nước cốt xoài", u: "ml", q: 20, k: "mango" },
        { n: "Nền trà olong", u: "ml", q: 100, k: "tea-oolong", p: "nen-tra-olong" },
        { n: "Đá viên", u: "gram", q: 250, k: "ice" },
        { n: "Thạch vải", u: "gram", q: 30, k: "jelly-lychee", p: "thach-vai" },
        { n: "Cam sấy + húng lũi (decor)", u: "cái", q: 1, k: "decor" }
      ],
      pack: ["Ly 20oz", "Nắp cầu", "Ống phi 12", "Muỗng nhựa"],
      steps: ["Cho lần lượt các nguyên liệu theo thứ tự trên và ½ đá vào ly, shake đều tay", "Cho hỗn hợp ra ly, thêm vài viên đá, cách miệng ly 2 cm", "Cho topping lên trên và decor", "Đậy nắp, chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      cup: { type: "ice", lid: "dome", layers: [["mango-tea", 140], ["jelly-lychee", 30]], ice: true, decor: true }
    },
    {
      id: "olong-xoai-macchiato-yogurt", name: "Olong xoài macchiato yogurt", cat: "tra-trai-cay", temp: "ice", sizes: null,
      aka: ["olong xoài", "trà xoài yogurt", "xoài macchiato"],
      ing: [
        { n: "Đường nước", u: "ml", q: 10, k: "sugar" },
        { n: "Nước cốt xoài", u: "ml", q: 20, k: "mango" },
        { n: "Nền trà olong", u: "ml", q: 100, k: "tea-oolong", p: "nen-tra-olong" },
        { n: "Đá viên", u: "gram", q: 250, k: "ice" },
        { n: "Milk foam yogurt", u: "gram", q: 40, k: "foam-yogurt", p: "nen-yogurt-pho-mai" },
        { n: "Xoài tươi", u: "gram", q: 50, k: "mango-cube" },
        { n: "Húng lũi (decor)", u: "cái", q: 1, k: "decor" }
      ],
      pack: ["Ly 20oz", "Nắp cầu", "Ống phi 6", "Muỗng nhựa"],
      steps: ["Cho lần lượt các nguyên liệu theo thứ tự trên và ½ đá vào ly, shake đều tay", "Cho hỗn hợp ra ly, thêm vài viên đá, cách miệng ly 2 cm", "Cho topping (milk foam yogurt, xoài tươi) lên trên và decor", "Đậy nắp, chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      cup: { type: "ice", lid: "dome", layers: [["mango-tea", 130], ["foam-yogurt", 40], ["mango-cube", 30]], ice: true, decor: "mint" }
    },
    {
      id: "olong-sen-macchiato-cheese", name: "Olong sen macchiato cheese", cat: "tra-trai-cay", temp: "ice", sizes: null,
      aka: ["trà sen", "olong sen", "sen cheese"],
      ing: [
        { n: "Đường nước", u: "ml", q: 20, k: "sugar" },
        { n: "Sen lon", u: "viên", q: 20, k: "lotus-seed" },
        { n: "Nền trà olong", u: "ml", q: 120, k: "tea-oolong", p: "nen-tra-olong" },
        { n: "Đá viên", u: "gram", q: 250, k: "ice" },
        { n: "Milk foam cheese", u: "gram", q: 40, k: "foam-cheese" }
      ],
      pack: ["Ly 20oz", "Nắp cầu", "Ống phi 6", "Muỗng nhựa"],
      steps: ["Cho lần lượt các nguyên liệu theo thứ tự trên và ½ đá vào ly, shake đều tay", "Cho hỗn hợp ra ly, thêm vài viên đá, cách miệng ly 2 cm", "Cho topping (milk foam cheese) lên trên và decor", "Đậy nắp, chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      cup: { type: "ice", lid: "dome", layers: [["lotus-seed", 30], ["tea-oolong", 140], ["foam-cheese", 40]], ice: true }
    },

    /* ───────── TRÀ SỮA MILK FOAM ───────── */
    {
      id: "ba-tuoc-sua-macchiato-cheese", name: "Bá tước sữa macchiato cheese", cat: "tra-sua", temp: "ice", sizes: null,
      aka: ["trà sữa bá tước", "earl grey milk tea", "trà sữa trân châu"],
      ing: [
        { n: "Trân châu", u: "gram", q: 50, k: "pearl" },
        { n: "Đường nước", u: "ml", q: 20, k: "sugar" },
        { n: "Nền trà sữa (bá tước)", u: "ml", q: 150, k: "milktea", p: "nen-tra-sua-ba-tuoc" },
        { n: "Đá viên", u: "gram", q: 230, k: "ice" },
        { n: "Bột chocolate", u: "gram", q: "0,1", k: "dust-choco" },
        { n: "Milk foam cheese", u: "gram", q: 40, k: "foam-cheese" }
      ],
      pack: ["Ly 20oz", "Nắp cầu", "Ống phi 12", "Muỗng nhựa"],
      steps: ["Cho lần lượt các nguyên liệu theo thứ tự trên (trừ đá và milk foam) vào ly, khuấy đều", "Cho đá vào ly và cho milk foam lên trên", "Rắc bột chocolate lên trên", "Đậy nắp, chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      cup: { type: "ice", lid: "dome", layers: [["pearl", 50], ["milktea", 170], ["foam-cheese", 40]], ice: true, dust: "choco" }
    },
    {
      id: "gao-rang-sua-macchiato-cheese", name: "Gạo rang sữa macchiato cheese", cat: "tra-sua", temp: "ice", sizes: null,
      aka: ["trà sữa gạo rang", "genmaicha milk tea", "gạo rang"],
      ing: [
        { n: "Trân châu", u: "gram", q: 50, k: "pearl" },
        { n: "Đường nước", u: "ml", q: 20, k: "sugar" },
        { n: "Nền trà sữa (gạo rang)", u: "ml", q: 150, k: "genmai-milk", p: "nen-tra-sua-gao-rang" },
        { n: "Đá viên", u: "gram", q: 230, k: "ice" },
        { n: "Milk foam cheese", u: "gram", q: 40, k: "foam-cheese" },
        { n: "Bột genmaicha", u: "gram", q: "0,1", k: "dust-genmai" }
      ],
      pack: ["Ly 20oz", "Nắp cầu", "Ống phi 12", "Muỗng nhựa"],
      steps: ["Cho lần lượt các nguyên liệu theo thứ tự trên (trừ đá và milk foam) vào ly, khuấy đều", "Cho đá vào ly và cho milk foam lên trên", "Rắc bột genmaicha", "Đậy nắp, chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      cup: { type: "ice", lid: "dome", layers: [["pearl", 50], ["genmai-milk", 170], ["foam-cheese", 40]], ice: true, dust: "genmai" }
    },
    {
      id: "olong-sua-macchiato-hat-de", name: "Olong sữa macchiato hạt dẻ", cat: "tra-sua", temp: "ice", sizes: null,
      aka: ["trà sữa olong", "olong hạt dẻ", "oolong milk tea"],
      ing: [
        { n: "Thạch houjicha", u: "gram", q: 50, k: "jelly-houjicha" },
        { n: "Đường nước", u: "ml", q: 20, k: "sugar" },
        { n: "Nền trà sữa (olong)", u: "ml", q: 150, k: "oolong-milk", p: "nen-tra-sua-olong" },
        { n: "Đá viên", u: "gram", q: 230, k: "ice" },
        { n: "Milk foam hạt dẻ", u: "gram", q: 40, k: "foam-chestnut", p: "milk-foam-hat-de" }
      ],
      pack: ["Ly 20oz", "Nắp cầu", "Ống phi 12", "Muỗng nhựa"],
      steps: ["Cho lần lượt các nguyên liệu theo thứ tự trên (trừ đá và milk foam) vào ly, khuấy đều", "Cho đá vào ly và cho milk foam lên trên", "Đậy nắp, chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      cup: { type: "ice", lid: "dome", layers: [["jelly-houjicha", 50], ["oolong-milk", 170], ["foam-chestnut", 40]], ice: true }
    },

    /* ───────── MATCHA ───────── */
    {
      id: "matcha-latte-nong", name: "Matcha latte nóng", cat: "matcha", temp: "hot", sizes: null,
      aka: ["matcha nóng", "trà xanh latte"],
      ing: [
        { n: "Bột matcha", u: "gram", q: 3, k: "matcha" },
        { n: "Nước nóng", u: "ml", q: 30, k: "water" },
        { n: "Sữa thanh trùng", u: "ml", q: 200, k: "milk" },
        { n: "Đường nâu gói", u: "gói", q: 1, side: true }
      ],
      pack: ["Tách cam lớn", "Dĩa cam lớn", "Muỗng nhỏ"],
      steps: ["Cân bột cho vào tách", "Cho nước nóng vào tách và khuấy đều cho tan bột", "Đánh sữa foam latte và tạo hình (art)", "Chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      cup: { type: "hot", vessel: "tach-lon", layers: [["matcha", 30], ["matcha-milk", 160], ["foam", 40]], top: "art-matcha" }
    },
    {
      id: "matcha-latte-da", name: "Matcha latte đá", cat: "matcha", temp: "ice", sizes: null,
      aka: ["matcha đá", "iced matcha", "trà xanh sữa đá"],
      ing: [
        { n: "Bột matcha", u: "gram", q: 3, k: "matcha" },
        { n: "Nước nóng", u: "ml", q: 50, k: "water" },
        { n: "Đường nước", u: "ml", q: 20, k: "sugar" },
        { n: "Sữa Vinamilk", u: "ml", q: 100, k: "milk" },
        { n: "Đá viên", u: "gram", q: 250, k: "ice" }
      ],
      pack: ["Ly 20oz", "Nắp bằng", "Ống phi 6"],
      steps: ["Cân bột và nước nóng vào ca đong, đánh tan", "Cho đường, sữa vào ly, đánh tạo bọt", "Cho đá vào ly và cho hỗn hợp bột lên trên", "Chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      cup: { type: "ice", lid: "flat", layers: [["milk", 120], ["matcha", 50]], ice: true }
    },
    {
      id: "matcha-dau-do", name: "Matcha đậu đỏ", cat: "matcha", temp: "ice", sizes: null,
      aka: ["matcha red bean", "trà xanh đậu đỏ"],
      ing: [
        { n: "Bột matcha", u: "gram", q: 3, k: "matcha" },
        { n: "Nước nóng", u: "ml", q: 50, k: "water" },
        { n: "Đậu đỏ", u: "gram", q: 40, k: "redbean" },
        { n: "Đường nước", u: "ml", q: 20, k: "sugar" },
        { n: "Sữa Vinamilk", u: "ml", q: 100, k: "milk" },
        { n: "Đá viên", u: "gram", q: 250, k: "ice" }
      ],
      pack: ["Ly 20oz", "Nắp cầu", "Ống phi 12"],
      steps: ["Cân bột và nước nóng vào ca đong, đánh tan", "Cho lần lượt đường, đậu đỏ, đá vào ly", "Cho sữa vào ly và cho hỗn hợp bột lên trên", "Chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      cup: { type: "ice", lid: "dome", layers: [["redbean", 40], ["milk", 110], ["matcha", 50]], ice: true }
    },

    /* ───────── HOUJICHA ───────── */
    {
      id: "houjicha-latte", name: "Houjicha latte", cat: "houjicha", temp: "ice", sizes: null,
      aka: ["hojicha", "houjicha", "trà rang sữa"],
      ing: [
        { n: "Bột houjicha", u: "gram", q: 3, k: "houjicha" },
        { n: "Nước nóng", u: "ml", q: 50, k: "water" },
        { n: "Đường nước", u: "ml", q: 20, k: "sugar" },
        { n: "Sữa Vinamilk", u: "ml", q: 100, k: "milk" },
        { n: "Đá viên", u: "gram", q: 250, k: "ice" }
      ],
      pack: ["Ly 20oz", "Nắp bằng", "Ống phi 6"],
      steps: ["Cân bột và nước nóng vào ca đong, đánh tan", "Cho đường, sữa vào ly, đánh tạo bọt", "Cho đá vào ly và cho hỗn hợp bột lên trên", "Chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      cup: { type: "ice", lid: "flat", layers: [["milk", 120], ["houjicha", 50]], ice: true }
    },
    {
      id: "houjicha-olong-latte", name: "Houjicha olong latte", cat: "houjicha", temp: "ice", sizes: null,
      aka: ["houjicha olong", "hojicha olong"],
      ing: [
        { n: "Bột houjicha", u: "gram", q: 3, k: "houjicha" },
        { n: "Nước nóng", u: "ml", q: 50, k: "water" },
        { n: "Đường nước", u: "ml", q: 20, k: "sugar" },
        { n: "Nền trà sữa olong", u: "ml", q: 80, k: "oolong-milk", p: "nen-tra-sua-olong" },
        { n: "Milk foam cheese", u: "gram", q: 40, k: "foam-cheese" },
        { n: "Đá viên", u: "gram", q: 250, k: "ice" }
      ],
      pack: ["Ly 20oz", "Nắp bằng", "Ống phi 6"],
      steps: ["Cân bột và nước nóng vào ca đong, đánh tan", "Cho lần lượt đường, nền trà sữa vào ly, đánh tạo bọt và cho đá vào ly", "Cho lần lượt hỗn hợp bột và milk foam lên trên", "Chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      cup: { type: "ice", lid: "flat", layers: [["oolong-milk", 100], ["houjicha", 50], ["foam-cheese", 40]], ice: true }
    },
    {
      id: "houjicha-macchiato-hat-de", name: "Houjicha macchiato hạt dẻ", cat: "houjicha", temp: "ice", sizes: null,
      aka: ["houjicha hạt dẻ", "hojicha chestnut"],
      ing: [
        { n: "Bột houjicha", u: "gram", q: 3, k: "houjicha" },
        { n: "Nước nóng", u: "ml", q: 50, k: "water" },
        { n: "Đường nước", u: "ml", q: 20, k: "sugar" },
        { n: "Sữa Vinamilk", u: "ml", q: 80, k: "milk" },
        { n: "Đá viên", u: "gram", q: 250, k: "ice" },
        { n: "Milk foam hạt dẻ", u: "gram", q: 40, k: "foam-chestnut", p: "milk-foam-hat-de" }
      ],
      pack: ["Ly 20oz", "Nắp bằng", "Ống phi 6"],
      steps: ["Cân bột và nước nóng vào ca đong, đánh tan", "Cho lần lượt đường, sữa vào ly, đánh tạo bọt", "Cho đá vào ly và cho hỗn hợp bột lên trên", "Cho lớp milk foam hạt dẻ lên trên", "Chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      notes: ["Bước 2 trong tài liệu ghi “nền trà sữa”, nhưng bảng thành phần chỉ có Sữa Vinamilk 80 ml. Hỏi lại quản lý nếu chưa chắc."],
      cup: { type: "ice", lid: "flat", layers: [["milk", 100], ["houjicha", 50], ["foam-chestnut", 40]], ice: true }
    },

    /* ───────── CHOCOLATE ───────── */
    {
      id: "chocolate-nong", name: "Chocolate nóng", cat: "chocolate", temp: "hot", sizes: null,
      aka: ["socola nóng", "hot chocolate", "cacao nóng"],
      ing: [
        { n: "Bột chocolate", u: "gram", q: 5, k: "choco" },
        { n: "Nước nóng", u: "ml", q: 30, k: "water" },
        { n: "Sữa thanh trùng", u: "ml", q: 200, k: "milk" },
        { n: "Đường nâu gói", u: "gói", q: 1, side: true }
      ],
      pack: ["Tách cam lớn", "Dĩa cam lớn", "Muỗng nhỏ"],
      steps: ["Cân bột cho vào tách", "Cho nước nóng vào tách và khuấy đều cho tan bột", "Đánh sữa foam latte và tạo hình (art)", "Chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      notes: ["Tài liệu ghi Đường nâu gói là “100”. Các món nóng khác đều dùng 1 gói, nên nhiều khả năng đây là 1 gói."],
      cup: { type: "hot", vessel: "tach-lon", layers: [["choco", 30], ["choco-milk", 160], ["foam", 40]], top: "art-choco" }
    },
    {
      id: "chocolate-da", name: "Chocolate đá", cat: "chocolate", temp: "ice", sizes: null,
      aka: ["socola đá", "iced chocolate", "cacao đá"],
      ing: [
        { n: "Bột chocolate", u: "gram", q: 8, k: "choco" },
        { n: "Nước nóng", u: "ml", q: 70, k: "water" },
        { n: "Sữa cream", u: "ml", q: 100, k: "cream" },
        { n: "Đá viên", u: "gram", q: 250, k: "ice" }
      ],
      pack: ["Ly 20oz", "Nắp bằng", "Ống phi 6"],
      steps: ["Cân bột và nước nóng vào ca đong, đánh tan", "Cho sữa vào ly, đánh tạo bọt", "Cho đá vào ly và cho hỗn hợp bột lên trên", "Chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      cup: { type: "ice", lid: "flat", layers: [["cream", 110], ["choco", 75]], ice: true }
    },
    {
      id: "chocolate-mo-anh-dao", name: "Chocolate mơ anh đào", cat: "chocolate", temp: "ice", sizes: null,
      aka: ["socola mơ", "chocolate anh đào", "chocolate cherry"],
      ing: [
        { n: "Bột chocolate", u: "gram", q: 8, k: "choco" },
        { n: "Nước nóng", u: "ml", q: 70, k: "water" },
        { n: "Đường nước", u: "ml", q: 20, k: "sugar" },
        { n: "Mứt mơ anh đào", u: "ml", q: 20, k: "apricot-cherry" },
        { n: "Sữa Vinamilk", u: "ml", q: 80, k: "milk" },
        { n: "Đá viên", u: "gram", q: 250, k: "ice" }
      ],
      pack: ["Ly 20oz", "Nắp bằng", "Ống phi 6"],
      steps: ["Cân bột và nước nóng vào ca đong, đánh tan", "Cho lần lượt đường, mứt vào ly", "Cho lần lượt đá và sữa vào ly", "Cho hỗn hợp bột lên trên", "Chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      cup: { type: "ice", lid: "flat", layers: [["apricot-cherry", 40], ["milk", 80], ["choco", 75]], ice: true }
    },
    {
      id: "chocolate-xoai", name: "Chocolate xoài", cat: "chocolate", temp: "ice", sizes: null,
      aka: ["socola xoài", "chocolate mango"],
      ing: [
        { n: "Bột chocolate", u: "gram", q: 8, k: "choco" },
        { n: "Nước nóng", u: "ml", q: 70, k: "water" },
        { n: "Đường nước", u: "ml", q: 20, k: "sugar" },
        { n: "Nước cốt xoài", u: "ml", q: 20, k: "mango" },
        { n: "Sữa Vinamilk", u: "ml", q: 80, k: "milk" },
        { n: "Đá viên", u: "gram", q: 250, k: "ice" }
      ],
      pack: ["Ly 20oz", "Nắp bằng", "Ống phi 6"],
      steps: ["Cân bột và nước nóng vào ca đong, đánh tan", "Cho lần lượt đường, nước cốt xoài vào ly", "Cho lần lượt đá và sữa vào ly", "Cho hỗn hợp bột lên trên", "Chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      cup: { type: "ice", lid: "flat", layers: [["mango", 40], ["milk", 80], ["choco", 75]], ice: true }
    },

    /* ───────── SMOOTHIE – ĐÁ XAY ───────── */
    {
      id: "bo-sua-hanh-nhan", name: "Bơ sữa hạnh nhân", cat: "da-xay", temp: "ice", sizes: null,
      aka: ["sinh tố bơ", "bơ sữa", "avocado"],
      ing: [
        { n: "Hỗn hợp bơ xay", u: "gram", q: 100, k: "avocado", p: "bo-xay" },
        { n: "Sữa cream", u: "ml", q: 40, k: "cream" },
        { n: "Sữa hạnh nhân", u: "ml", q: 80, k: "almond-milk" },
        { n: "Đá viên", u: "gram", q: 250, k: "ice" },
        { n: "Hạnh nhân lát", u: "gram", q: 5, k: "almond" }
      ],
      pack: ["Ly 20oz", "Nắp cầu", "Ống phi 6", "Muỗng nhựa"],
      steps: ["Cho đá vào ly", "Cho sữa vào ly", "Cho bơ lên trên", "Rắc hạnh nhân lên bơ", "Chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      cup: { type: "ice", lid: "dome", layers: [["almond-milk", 120], ["avocado", 100]], ice: true, sprinkle: "almond" }
    },
    {
      id: "mocha-da-xay", name: "Mocha đá xay", cat: "da-xay", temp: "blend", sizes: null,
      aka: ["mocha frappe", "frappe", "cà phê đá xay"],
      ing: [
        { n: "Bột frappe", u: "gram", q: 20, k: "powder" },
        { n: "Bột chocolate", u: "gram", q: 8, k: "choco" },
        { n: "Đường nước", u: "ml", q: 20, k: "sugar" },
        { n: "Sữa cream", u: "ml", q: 100, k: "cream" },
        { n: "An Viên coffee", u: "ml", q: 20, k: "coffee" },
        { n: "Milk foam nguyên vị", u: "gram", q: 40, k: "foam" },
        { n: "Đá viên", u: "gram", q: 230, k: "ice" }
      ],
      pack: ["Ly 20oz", "Nắp cầu", "Ống phi 6", "Muỗng nhựa"],
      steps: ["Cho lần lượt đá, bột, đồ lỏng vào cối xay", "Xay mịn hỗn hợp", "Cho hỗn hợp ra ly và cho milk foam lên", "Rắc bột chocolate lên trên", "Chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      cup: { type: "ice", lid: "dome", layers: [["frappe-mocha", 190], ["foam", 45]], slush: true, dust: "choco" }
    },
    {
      id: "genmaicha-da-xay", name: "Genmaicha đá xay", cat: "da-xay", temp: "blend", sizes: null,
      aka: ["gạo rang đá xay", "genmaicha frappe"],
      ing: [
        { n: "Bột frappe", u: "gram", q: 20, k: "powder" },
        { n: "Bột genmaicha", u: "gram", q: 8, k: "genmai" },
        { n: "Đường nước", u: "ml", q: 20, k: "sugar" },
        { n: "Sữa cream", u: "ml", q: 100, k: "cream" },
        { n: "Ngũ cốc", u: "gram", q: 15, k: "cereal" },
        { n: "Milk foam nguyên vị", u: "gram", q: 40, k: "foam" },
        { n: "Đá viên", u: "gram", q: 230, k: "ice" }
      ],
      pack: ["Ly 20oz", "Nắp cầu", "Ống phi 6", "Muỗng nhựa"],
      steps: ["Cho lần lượt đá, bột, đồ lỏng vào cối xay", "Xay mịn hỗn hợp và đổ ra ly", "Cho lần lượt ngũ cốc và milk foam lên trên", "Rắc bột genmaicha lên trên", "Chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      cup: { type: "ice", lid: "dome", layers: [["frappe-genmai", 180], ["cereal", 15], ["foam", 45]], slush: true, dust: "genmai" }
    },

    /* ───────── YOGURT ICE ───────── */
    {
      id: "yogurt-pho-mai-xoai", name: "Yogurt phô mai xoài", cat: "yogurt", temp: "ice", sizes: null,
      aka: ["sữa chua xoài", "yogurt xoài"],
      ing: [
        { n: "Nền milk foam yogurt phô mai", u: "gram", q: 30, k: "foam-yogurt", p: "nen-yogurt-pho-mai" },
        { n: "Sữa chua Vinamilk", u: "hũ", q: 1, k: "yogurt" },
        { n: "Đường nước", u: "ml", q: 10, k: "sugar" },
        { n: "Nền nước chanh", u: "ml", q: 10, k: "lemon", p: "nen-nuoc-chanh" },
        { n: "Nước cốt xoài", u: "ml", q: 30, k: "mango" },
        { n: "Sữa tươi", u: "ml", q: 20, k: "milk" },
        { n: "Xoài tươi", u: "gram", q: 50, k: "mango-cube" },
        { n: "Đá viên", u: "gram", q: 200, k: "ice" },
        { n: "Cam sấy + húng lũi (decor)", u: "cái", q: 1, k: "decor" }
      ],
      pack: ["Ly 16oz", "Nắp cầu", "Ống phi 12", "Muỗng nhựa"],
      steps: ["Cho lần lượt các nguyên liệu và ½ đá vào shaker (trừ xoài tươi)", "Shake đều tay 5 giây và cho ra ly", "Cho thêm vài viên đá và xoài tươi lên trên", "Decor đồ uống", "Chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      cup: { type: "ice", lid: "dome", layers: [["yogurt-mango", 170], ["mango-cube", 40]], ice: true, decor: true }
    },
    {
      id: "yogurt-pho-mai-dau", name: "Yogurt phô mai dâu", cat: "yogurt", temp: "ice", sizes: null,
      aka: ["sữa chua dâu", "yogurt dâu"],
      ing: [
        { n: "Nền milk foam yogurt phô mai", u: "gram", q: 30, k: "foam-yogurt", p: "nen-yogurt-pho-mai" },
        { n: "Sữa chua Vinamilk", u: "hũ", q: 1, k: "yogurt" },
        { n: "Đường nước", u: "ml", q: 10, k: "sugar" },
        { n: "Nền nước chanh", u: "ml", q: 10, k: "lemon", p: "nen-nuoc-chanh" },
        { n: "Mứt dâu", u: "ml", q: 30, k: "strawberry" },
        { n: "Sữa tươi", u: "ml", q: 20, k: "milk" },
        { n: "Hạt thủy tinh", u: "gram", q: 50, k: "glass-pearl" },
        { n: "Đá viên", u: "gram", q: 200, k: "ice" },
        { n: "Cam sấy + húng lũi (decor)", u: "cái", q: 1, k: "decor" }
      ],
      pack: ["Ly 16oz", "Nắp cầu", "Ống phi 12", "Muỗng nhựa"],
      steps: ["Cho lần lượt các nguyên liệu và ½ đá vào shaker (trừ hạt thủy tinh)", "Shake đều tay 5 giây và cho ra ly", "Cho thêm vài viên đá và hạt thủy tinh lên trên", "Decor đồ uống", "Chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      cup: { type: "ice", lid: "dome", layers: [["yogurt-berry", 170], ["glass-pearl", 45]], ice: true, decor: true }
    },
    {
      id: "yogurt-pho-mai-yuzu-dao", name: "Yogurt phô mai yuzu đào", cat: "yogurt", temp: "ice", sizes: null,
      aka: ["sữa chua yuzu", "yogurt đào", "yuzu"],
      ing: [
        { n: "Nền milk foam yogurt phô mai", u: "gram", q: 30, k: "foam-yogurt", p: "nen-yogurt-pho-mai" },
        { n: "Sữa chua Vinamilk", u: "hũ", q: 1, k: "yogurt" },
        { n: "Đường nước", u: "ml", q: 10, k: "sugar" },
        { n: "Nền nước chanh", u: "ml", q: 10, k: "lemon", p: "nen-nuoc-chanh" },
        { n: "Syrup yuzu", u: "ml", q: 30, k: "yuzu" },
        { n: "Sữa tươi", u: "ml", q: 20, k: "milk" },
        { n: "Thạch đào", u: "gram", q: 50, k: "jelly-peach", p: "thach-dao" },
        { n: "Đá viên", u: "gram", q: 200, k: "ice" },
        { n: "Cam sấy + húng lũi (decor)", u: "cái", q: 1, k: "decor" }
      ],
      pack: ["Ly 16oz", "Nắp cầu", "Ống phi 12", "Muỗng nhựa"],
      steps: ["Cho lần lượt các nguyên liệu và ½ đá vào shaker (trừ thạch đào)", "Shake đều tay 5 giây và cho ra ly", "Cho thêm vài viên đá và thạch đào lên trên", "Decor đồ uống", "Chuẩn bị dụng cụ uống", "Phục vụ khách hàng"],
      cup: { type: "ice", lid: "dome", layers: [["yogurt-yuzu", 170], ["jelly-peach", 45]], ice: true, decor: true }
    }
  ],

  /* ───────── BÁN THÀNH PHẨM ───────── */
  preps: [
    {
      id: "nen-tra-olong", name: "Nền trà olong", group: "Nền trà trái cây", yield: "4200 ml", shelf: "10 tiếng",
      ing: [["Trà Olong Thiết Quan Âm", "gói", 4], ["Nước nóng", "ml", 2800], ["Đá viên", "gram", 1600]],
      steps: ["Cho nước nóng (>90 độ) vào ca đong", "Cho túi trà vào, đảo qua lại 5 lần, đậy kín nắp, ủ 15 phút", "Ép nhẹ túi trà, chắt nước và cho đá vào khuấy đều", "Ghi DATE và bảo quản kín tủ mát (<5 độ)"]
    },
    {
      id: "nen-tra-ba-tuoc", name: "Nền trà bá tước", group: "Nền trà trái cây", yield: "4200 ml", shelf: "10 tiếng",
      ing: [["Trà Bá Tước", "gói", 4], ["Nước nóng", "ml", 2800], ["Đá viên", "gram", 1600]],
      steps: ["Cho nước nóng (>90 độ) vào ca đong", "Cho túi trà vào, đảo qua lại 5 lần, đậy kín nắp, ủ 15 phút", "Ép nhẹ túi trà, chắt nước và cho đá vào khuấy đều", "Ghi DATE và bảo quản kín tủ mát (<5 độ)"]
    },
    {
      id: "nen-tra-dao", name: "Nền trà đào", group: "Nền trà trái cây", yield: "300 ml", shelf: "10 tiếng",
      ing: [["Trà Đào", "gói", 1], ["Nước nóng", "ml", 350]],
      steps: ["Cho nước nóng (>90 độ) vào ca đong", "Cho túi trà vào, đảo qua lại 5 lần, đậy kín nắp, ủ 15 phút", "Ghi DATE và bảo quản kín tủ mát (<5 độ)"]
    },
    {
      id: "nen-tra-sua-olong", name: "Nền trà sữa olong", group: "Nền trà sữa", yield: "2500 ml", shelf: "72 tiếng",
      ing: [["Trà Olong Thiết Quan Âm", "gói", 4], ["Nước nóng", "ml", 2000], ["Bột kem béo MT35", "gram", 600], ["Đá viên", "gram", 300]],
      steps: ["Cho nước nóng (>90 độ) vào ca đong", "Cho túi trà vào, đảo qua lại 5 lần, đậy kín nắp, ủ 20 phút", "Ép nhẹ túi trà, chắt nước, cho bột vào khuấy đều cho tan", "Cho đá vào khuấy đều", "Ghi DATE và bảo quản kín tủ mát (<5 độ)"]
    },
    {
      id: "nen-tra-sua-ba-tuoc", name: "Nền trà sữa bá tước", group: "Nền trà sữa", yield: "2500 ml", shelf: "72 tiếng",
      ing: [["Trà Bá Tước", "gói", 4], ["Nước nóng", "ml", 2000], ["Bột kem béo MT35", "gram", 600], ["Đá viên", "gram", 300]],
      steps: ["Cho nước nóng (>90 độ) vào ca đong", "Cho túi trà vào, đảo qua lại 5 lần, đậy kín nắp, ủ 20 phút", "Ép nhẹ túi trà, chắt nước, cho bột vào khuấy đều cho tan", "Cho đá vào khuấy đều", "Ghi DATE và bảo quản kín tủ mát (<5 độ)"]
    },
    {
      id: "nen-tra-sua-gao-rang", name: "Nền trà sữa gạo rang", group: "Nền trà sữa", yield: "2500 ml", shelf: "72 tiếng",
      ing: [["Trà Xanh Gạo", "gram", 100], ["Nước nóng", "ml", 2000], ["Bột kem béo MT35", "gram", 600], ["Đá viên", "gram", 300]],
      steps: ["Cho nước nóng (>90 độ) vào ca đong", "Cho trà vào, đảo qua lại 5 lần, đậy kín nắp, ủ 20 phút", "Ép nhẹ túi trà, chắt nước, cho bột vào khuấy đều cho tan", "Cho đá vào khuấy đều", "Ghi DATE và bảo quản kín tủ mát (<5 độ)"]
    },
    {
      id: "milk-foam-muoi", name: "Milk foam muối", group: "Nền milk foam", yield: "650 gram", shelf: "48 tiếng",
      ing: [["Bột milk foam nguyên vị", "gram", 150], ["Bột milk foam phô mai", "gram", 50], ["Bột kem béo MT35", "gram", 50], ["Muối hồng", "gram", 3], ["Nước lạnh", "ml", 300]],
      steps: ["Cân lần lượt các loại bột và muối vào ca đánh", "Cho nước đã làm lạnh vào ca đánh", "Đánh mức 1 (1 phút)", "Đánh mức 5 (2 phút)"]
    },
    {
      id: "milk-foam-dua", name: "Milk foam dừa", group: "Nền milk foam", yield: "600 gram", shelf: "48 tiếng",
      ing: [["Bột milk foam nguyên vị", "gram", 100], ["Bột cốt dừa", "gram", 50], ["Bột kem béo MT35", "gram", 50], ["Muối hồng", "gram", 3], ["Nước lạnh", "ml", 300]],
      steps: ["Cân lần lượt các loại bột và muối vào ca đánh", "Cho nước đã làm lạnh vào ca đánh", "Đánh mức 1 (1 phút)", "Đánh mức 5 (2 phút)"]
    },
    {
      id: "milk-foam-hat-de", name: "Milk foam hạt dẻ", group: "Nền milk foam", yield: "650 gram", shelf: "48 tiếng",
      ing: [["Bột milk foam nguyên vị", "gram", 100], ["Sốt hạt dẻ", "gram", 50], ["Muối hồng", "gram", 3], ["Bột kem béo MT35", "gram", 50], ["Nước lạnh", "ml", 200]],
      steps: ["Cân lần lượt các loại bột và muối vào ca đánh", "Cho nước đã làm lạnh vào ca đánh", "Đánh mức 1 (1 phút)", "Đánh mức 5 (2 phút)"]
    },
    {
      id: "nen-yogurt-pho-mai", name: "Nền yogurt phô mai", group: "Nền milk foam", yield: "600 gram", shelf: "48 tiếng",
      ing: [["Bột milk foam phô mai", "gram", 100], ["Bột yogurt", "gram", 50], ["Bột kem béo MT35", "gram", 50], ["Nước lạnh", "ml", 300]],
      steps: ["Cân lần lượt các loại bột vào ca đánh", "Cho nước đã làm lạnh vào ca đánh", "Đánh mức 1 (1 phút)", "Đánh mức 5 (2 phút)"]
    },
    {
      id: "nen-nuoc-chanh", name: "Nền nước chanh", group: "Các loại khác", yield: "100 ml", shelf: "48 tiếng",
      ing: [["Bột chanh", "gram", 10], ["Nước lọc", "ml", 100]],
      steps: ["Cân bột chanh ra ca đong", "Cho nước lọc vào khuấy đều cho tan", "Ghi DATE và bảo quản kín tủ mát (<5 độ)"]
    },
    {
      id: "nen-cold-brew", name: "Nền cold brew", group: "Các loại khác", yield: "800 ml", shelf: "5 ngày",
      ing: [["Typica", "gram", 90], ["Nước lọc", "ml", 950]],
      steps: ["Lấy cà phê từ tủ đông, cân định lượng từng ống lọc", "Rải đều cà phê ra khay, cho cà phê “thở” 5 phút", "Cân lại định lượng từng ống, xay theo cỡ xay quy định", "Cho nước lọc vào bình ủ theo đúng định lượng", "Thả từng ống lọc vào từng bình ủ", "Ghi DATE và ủ ở nhiệt độ phòng trong 14 tiếng", "Lấy lõi lọc ra và bảo quản kín tủ mát"]
    },
    {
      id: "thach-dao", name: "Thạch đào", group: "Các loại khác", yield: "780 gram", shelf: "5 ngày",
      ing: [["Bột rau câu", "gram", 100], ["Nước nóng", "ml", 300], ["Nền trà đào", "ml", 300], ["Mứt đào hồng", "ml", 40], ["Đường nước đặc", "ml", 40]],
      steps: ["Cho bột và nước nóng vào nồi, khuấy đều cho tan bột", "Cho nền trà, mứt, đường vào hỗn hợp, khuấy đều đến khi tan", "Cho ra ca/khay, để nguội hoàn toàn ở nhiệt độ phòng trong 2 tiếng", "Ghi DATE và bảo quản kín tủ mát (<5 độ)"]
    },
    {
      id: "thach-vai", name: "Thạch vải", group: "Các loại khác", yield: "780 gram", shelf: "5 ngày",
      ing: [["Bột rau câu", "gram", 100], ["Nước nóng", "ml", 300], ["Nền trà olong", "ml", 300], ["Syrup vải", "ml", 40], ["Đường nước đặc", "ml", 40]],
      steps: ["Cho bột và nước nóng vào nồi, khuấy đều cho tan bột", "Cho nền trà, syrup, đường vào hỗn hợp, khuấy đều đến khi tan", "Cho ra ca/khay, để nguội ở nhiệt độ phòng trong 30 phút", "Ghi DATE và bảo quản kín tủ mát (<5 độ)"]
    },
    {
      id: "pudding", name: "Pudding", group: "Các loại khác", yield: "600 gram", shelf: "5 ngày",
      ing: [["Bột pudding", "gram", 100], ["Nước nóng", "ml", 500]],
      steps: ["Cân bột, cho nước nóng vào khuấy đều", "Đổ ra khay, để nguội 10 phút ở nhiệt độ phòng", "Ghi DATE và bảo quản kín tủ mát (<5 độ)"]
    },
    {
      id: "bo-xay", name: "Bơ xay (hỗn hợp bơ xay)", group: "Các loại khác", yield: "1750 gram", shelf: "24 tiếng",
      ing: [["Bơ tươi", "gram", 1000], ["Đường nước đặc", "ml", 200], ["Nước lọc", "ml", 250]],
      steps: ["Cân bơ, cho lần lượt các nguyên liệu vào cối xay", "Xay 2 lần", "Ghi DATE và bảo quản kín tủ mát (<5 độ)"],
      notes: ["Trang tài liệu bị cắt ở cuối bảng: tổng các nguyên liệu đang thấy là 1450 g, ít hơn thành phẩm 1750 g — có thể còn một nguyên liệu chưa hiện. Hỏi quản lý để bổ sung."]
    }
  ],

  /* ───────── BẢNG DATE NGUYÊN VẬT LIỆU ───────── */
  shelf: [
    ["Nền trà trái cây", "Đã chế biến", "10 tiếng", "Tủ mát (<5 độ)"],
    ["Nền trà sữa", "Đã chế biến", "72 tiếng", "Tủ mát (<5 độ)"],
    ["Nền nước chanh", "Đã chế biến", "48 tiếng", "Tủ mát (<5 độ)"],
    ["Milk foam", "Đã chế biến", "48 tiếng", "Tủ mát (<5 độ)"],
    ["Nền cold brew", "Đã chế biến", "5 ngày", "Tủ mát (<5 độ)"],
    ["Thạch", "Đã chế biến", "5 ngày", "Tủ mát (<5 độ)"],
    ["Trân châu", "Đã chế biến", "8 tiếng", "Tủ mát (<5 độ)"],
    ["Pudding", "Đã chế biến", "5 ngày", "Tủ mát (<5 độ)"],
    ["Hỗn hợp bơ xay", "Đã chế biến", "24 tiếng", "Tủ mát (<5 độ)"],
    ["Các loại bột", "Đã khui", "5 ngày", "Nhiệt độ phòng (<25 độ)"],
    ["Các loại trà", "Đã khui", "5 ngày", "Nhiệt độ phòng (<25 độ)"],
    ["Các loại mứt trái cây", "Đã khui", "3 ngày", "Nhiệt độ phòng (<25 độ)"],
    ["Đường nước", "Đã khui", "2 ngày", "Nhiệt độ phòng (<25 độ)"],
    ["Sữa đặc", "Đã khui", "1 ngày", "Nhiệt độ phòng (<25 độ)"],
    ["Sữa tươi", "Đã khui", "3 ngày", "Tủ mát (<5 độ)"],
    ["Kem rich", "Đã khui", "3 ngày", "Tủ mát (<5 độ)"],
    ["Topping thạch", "Đã khui", "1 ngày", "Tủ mát (<5 độ)"],
    ["Topping đồ lon", "Đã khui", "1 ngày", "Tủ mát (<5 độ)"],
    ["Trái cây tươi", "Đã chế biến", "2 ngày", "Tủ mát (<5 độ)"],
    ["Trái cây sấy", "Đã khui", "7 ngày", "Nhiệt độ phòng (<25 độ)"],
    ["Ngũ cốc", "Đã khui", "3 ngày", "Nhiệt độ phòng (<25 độ)"],
    ["Cà phê hạt", "Đã khui", "2 ngày", "Nhiệt độ phòng (<25 độ)"],
    ["Bánh ngọt (tủ đông)", "Tủ đông", "7 ngày", "Tủ đông (<2 độ)"],
    ["Bánh nướng (tủ đông)", "Tủ đông", "7 ngày", "Tủ đông (<2 độ)"],
    ["Bánh ngọt (tủ mát)", "Tủ mát", "3 ngày", "Tủ mát (<5 độ)"],
    ["Bánh nướng (tủ mát)", "Tủ mát", "3 ngày", "Tủ mát (<5 độ)"],
    ["Nước ép", "Đã chế biến", "2 ngày", "Tủ mát (<5 độ)"],
    ["Kombucha", "Đã chế biến", "10 ngày", "Tủ mát (<5 độ)"],
    ["Dừa tươi", "Chưa khui", "5 ngày", "Tủ mát (<5 độ)"]
  ]
};
