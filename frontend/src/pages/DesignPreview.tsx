import { BookDetailPage } from './BookDetailPage';
import { BookListPage } from './BookListPage';
import { LandingPage } from './LandingPage';
import { MyPage } from './MyPage';
import { TradeProgressPage } from './TradeProgressPage';

const sections = [
  { title: '1. Landing Page', component: <LandingPage /> },
  { title: '2. Book List Page', component: <BookListPage /> },
  { title: '3. Book Detail Page', component: <BookDetailPage /> },
  { title: '4. Trade Progress Page', component: <TradeProgressPage /> },
  { title: '5. My Page', component: <MyPage /> },
];

export default function DesignPreview() {
  return (
    <div className="bg-slate-200">
      {sections.map((section) => (
        <section key={section.title} className="border-b border-slate-300">
          <div className="sticky top-0 z-40 border-b border-slate-300 bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
            {section.title}
          </div>
          {section.component}
        </section>
      ))}
    </div>
  );
}
