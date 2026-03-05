export default function Footer() {
  return (
    <footer className="bg-zinc-900 text-white pt-16 pb-8 px-6 md:px-12 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left">
        <div>
          <h3 className="text-xl font-bold mb-4 tracking-wider">
            Bamblue <span className="text-pink-400">store</span>
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
            YOUTH ELEVATED. SIMPLY STYLISH.<br />
            ยกระดับสไตล์ของคุณให้โดดเด่นและเป็นตัวเองในทุกๆ วัน ด้วยแฟชั่นสไตล์ K-Fashion
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold tracking-widest mb-4 text-gray-200">SHOP</h4>
          <ul className="text-gray-400 text-sm space-y-3">
            <li><a href="#" className="hover:text-pink-400 transition-colors">ทั้งหมด (All)</a></li>
            <li><a href="#" className="hover:text-pink-400 transition-colors">เสื้อ (Shirts)</a></li>
            <li><a href="#" className="hover:text-pink-400 transition-colors">BOTTOMS เดรส (Dresses)</a></li>
            <li><a href="#" className="hover:text-pink-400 transition-colors">ชุดเซ็ต (Sets)</a></li>
            <li><a href="#" className="hover:text-pink-400 transition-colors">โปรโมชั่น (Promotions)</a></li>

          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold tracking-widest mb-4 text-gray-200">CONNECT WITH US</h4>
          <div className="flex justify-center md:justify-start space-x-4 mb-4">
            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-sm font-bold hover:bg-pink-400 hover:text-white transition-all">IG</a>
            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-sm font-bold hover:bg-pink-400 hover:text-white transition-all">FB</a>
            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-sm font-bold hover:bg-pink-400 hover:text-white transition-all">X</a>
          </div>
          <p className="text-gray-400 text-sm">Line: @bambluestore</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-xs tracking-wider">
        &copy; {new Date().getFullYear()} Bamblue Store. All rights reserved.
      </div>
    </footer>
  );
}