const PRODUCTS = [
  ["Muga Dupatta (Golden)", 2400, "Single size 2.5m; WITH blouse piece ₹2,900", "In stock: 12", "muga, dupatta, golden, assamese, japi, gift"],
  ["Mekhela Chador (Muga)", 8500, "M/L/XL; Red border; White base", "In stock: 4", "mekhela, chador, muga, assamese, traditional, wedding"],
  ["Mekhela Chador (Cotton)", 3200, "M/L/XL; Assam cotton; 4 colors (red, blue, green, cream)", "In stock: 20+", "mekhela, chador, cotton, daily wear, cheap, affordable"],
  ["Gamusa (Set of 2)", 350, "Standard size; Red-white traditional", "In stock: 50+", "gamusa, gamocha, gift, traditional, souvenir, welcome"],
  ["Japi (Decorative)", 1200, "Medium 18 inch; Bamboo with cloth cover", "In stock: 8", "japi, hat, decor, souvenir, traditional, showpiece"],
  ["Muga Silk Scarf", 1500, "1.8m; Natural golden color", "In stock: 15", "muga, scarf, stole, silk, golden, lightweight"],
  ["Assamese Jewellery Set (Gold-plated)", 1800, "Necklace + earrings; Dokona style", "In stock: 6", "jewellery, dokona, necklace, earrings, gold, wedding, mukut"],
  ["Bihu Dhol (Small)", 2200, "12 inch; Goat skin; With strap", "In stock: 3", "dhol, drum, bihu, music, folk, instrument"],
];

const RULES = [
  ["delivery", "Guwahati: same-day delivery via Rapido, charge ₹40. Rest of Assam (Jorhat, Dibrugarh, Silchar, Tezpur): 3-4 days, charge ₹80. Outside Assam (Delhi, Mumbai, Bangalore etc): 5-7 days, charge ₹150 via India Post / courier."],
  ["delivery", "Free delivery on orders above ₹3,000 anywhere in Assam."],
  ["payment", "COD available within Assam only (₹50 extra COD fee). Prepaid via GPay / PhonePe / Paytm / bank transfer — no extra fee. No international payments."],
  ["returns", "7-day return if item is damaged or wrong product. Exchange for size available once. No return on custom-made items. Return courier charge borne by us if our mistake, by customer otherwise."],
  ["shipping_international", "We do NOT ship outside India."],
  ["discount", "10% off on orders above ₹5,000. Bihu season (April) special: no extra discount, demand is high — politely decline discount requests during Bihu."],
];

const PAST_REPLIES = [
  ["muga dupatta kitna?", "Namaste! Muga dupatta ₹2,400 ka hai. Guwahati me same-day delivery, baaki Assam me 3-4 din. Order karna hai toh bataiye 😊"],
  ["mekhela chador cotton wala price batao", "Hello! Cotton mekhela chador ₹3,200 ka hai. M, L, XL size available hai — red, blue, green, cream colors me. COD bhi chalega Assam ke andar 🙏"],
  ["COD hai kya?", "Ji, COD available hai Assam ke andar only, ₹50 extra lagta hai. Prepaid karenge toh GPay/PhonePe pe koi charge nahi. Bahar Assam ke liye COD nahi hai."],
  ["Jorhat tak delivery hoga?", "Haan bhaiya, Jorhat tak delivery hota hai. 3-4 din lagte hain, charges ₹80. ₹3,000 se upar order pe free delivery hai Assam me 👍"],
  ["gamusa gift ke liye accha rahega?", "Bilkul! Gamusa gift ke liye best hai — set of 2 me ₹350 ka. Traditional red-white design. Bahar se log aksar yahi lete hain souvenir ke liye 🙏"],
  ["size k available hai?", "Kaunsa item chahiye? Mekhela chador me M, L, XL sab available hai. Dupatta single size hai. Bataiye kya chahiye, stock dikha deti hoon."],
  ["discount milega?", "Sorry ji, fixed price hai 🙏 Lekin ₹5,000 se upar order pe 10% off mil jayega. Bihu season me demand zyada hoti hai, tab discount nahi chalta."],
  ["international bhej sakte hain?", "Sorry, abhi international shipping nahi hai. Sirf India ke andar bhejte hain. Delhi/Mumbai/Bangalore tak 5-7 din me ₹150 me pahunch jayega."],
  ["jewellery set me kya kya aata hai?", "Dokona style necklace + earrings aata hai, gold-plated. ₹1,800 ka. 6 piece stock me hai. Wedding ke liye log yahi lete hain 👌"],
  ["repair ho jayega purana mekhela?", "Ji, nahi — hum sirf naya bechte hain, repair service nahi hai. Sorry 🙏 Agar naya chahiye toh cotton wala dekh lijiye ₹3,200 me."],
  ["bihu dhol chahiye", "Bihu dhol available hai — 12 inch, goat skin, ₹2,200. Strap ke saath aata hai. 3 piece stock me hai. Bihu pe demand zyada hai, jaldi le lijiye 🎶"],
  ["dam koto muga orutia?", "Muga orutia amar pas nai sob hot. Muga scarf ache ₹1,500 te, dupatta ₹2,400. Ki lagise bolo! 😊"],
];

export function seedDemo(db) {
  const insertProduct = db.prepare(
    "INSERT INTO products (name, price, variants, stock, tags) VALUES (?, ?, ?, ?, ?)"
  );
  const insertRule = db.prepare("INSERT INTO rules (category, content) VALUES (?, ?)");
  const insertReply = db.prepare(
    "INSERT INTO past_replies (customer_msg, seller_reply) VALUES (?, ?)"
  );
  const tx = db.transaction(() => {
    db.prepare(
      "INSERT OR IGNORE INTO shop (id, name, tone_notes) VALUES (1, 'Muga Ghar, Guwahati', 'Friendly Hinglish with namaste/bhaiya. Light emojis 😊🙏👍 but not excessive. Starts replies with greeting. Prices always with ₹. Ends with a soft call to action. Sometimes Assamese when customer writes Assamese.')"
    ).run();
    for (const p of PRODUCTS) insertProduct.run(...p);
    for (const r of RULES) insertRule.run(...r);
    for (const r of PAST_REPLIES) insertReply.run(...r);
  });
  tx();
}
