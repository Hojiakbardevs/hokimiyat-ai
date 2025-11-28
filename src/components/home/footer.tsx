import { Link } from "react-router-dom";
import Logos from "@/assets/logowhite.svg";
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t py-12 md:py-16">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brend blok */}
          <div className="space-y-4">
            <div className="flex items-center">
              {" "}
              <img src={Logos} alt="Institut AI" className="w-12" />
              <h3 className="text-lg font-bold">Institut AI</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Davlat idoralari va yirik tashkilotlar uchun mo‘ljallangan,
              xavfsiz va moslashtiriladigan hujjatlarni avtomatlashtirish
              platformasi.
            </p>
          </div>

          {/* Mahsulot */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold">Mahsulot</h3>
            <nav aria-label="Product Navigation">
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="#features"
                    className="text-muted-foreground hover:text-foreground">
                    Imkoniyatlar
                  </Link>
                </li>
                <li>
                  <Link
                    to="#security"
                    className="text-muted-foreground hover:text-foreground">
                    Xavfsizlik
                  </Link>
                </li>
                <li>
                  <Link
                    to="#enterprise"
                    className="text-muted-foreground hover:text-foreground">
                    Tashkilotlar uchun
                  </Link>
                </li>
                <li>
                  <Link
                    to="#government"
                    className="text-muted-foreground hover:text-foreground">
                    Institutlar uchun
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Resurslar */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold">Resurslar</h3>
            <nav aria-label="Resources Navigation">
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/documentation"
                    className="text-muted-foreground hover:text-foreground">
                    Dokumentatsiya
                  </Link>
                </li>
                <li>
                  <Link
                    to="/case-studies"
                    className="text-muted-foreground hover:text-foreground">
                    Amaliy misollar
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blog"
                    className="text-muted-foreground hover:text-foreground">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    to="/support"
                    className="text-muted-foreground hover:text-foreground">
                    Qo‘llab-quvvatlash
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Kompaniya / loyiha */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold">Loyiha</h3>
            <nav aria-label="Company Navigation">
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/about"
                    className="text-muted-foreground hover:text-foreground">
                    Biz haqimizda
                  </Link>
                </li>
                <li>
                  <Link
                    to="/careers"
                    className="text-muted-foreground hover:text-foreground">
                    Bo‘sh ish o‘rinlari
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-muted-foreground hover:text-foreground">
                    Aloqa
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy"
                    className="text-muted-foreground hover:text-foreground">
                    Maxfiylik siyosati
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Pastki qism */}
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Institut AI. Barcha huquqlar himoyalangan.
          </p>
          <div className="flex gap-4">
            {/* Linklarni keyin haqiqiy sahifalarga almashtirasiz */}
            <Link
              to="https://linkedin.com"
              className="text-muted-foreground hover:text-foreground"
              aria-label="LinkedIn">
              {/* ... svg qoladi ... */}
            </Link>
            <Link
              to="https://twitter.com"
              className="text-muted-foreground hover:text-foreground"
              aria-label="Twitter">
              {/* ... svg qoladi ... */}
            </Link>
            <Link
              to="https://github.com"
              className="text-muted-foreground hover:text-foreground"
              aria-label="GitHub">
              {/* ... svg qoladi ... */}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
