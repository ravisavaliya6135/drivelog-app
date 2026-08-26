import { renderToString } from 'react-dom/server';
import { StaticRouter, Routes, Route } from 'react-router';
import { StateGuide } from '../pages/StateGuide';
import { StateGuideIndex } from '../pages/StateGuideIndex';
import { About } from '../pages/About';
import { HelpCenter } from '../pages/HelpCenter';
import { PrivacyPolicy } from '../pages/PrivacyPolicy';
import { TermsOfUse } from '../pages/TermsOfUse';
import { ContactFeedback } from '../pages/ContactFeedback';
import { US_STATES } from '../types';

export const stateData = US_STATES;

/**
 * Renders the StateGuide page for a given /dmv/:stateCode path to a
 * static HTML string. Runs in Node during the post-build prerender step;
 * no browser APIs are touched by this route's component tree.
 */
export function renderStateGuide(path: string): string {
  return renderToString(
    <StaticRouter location={path}>
      <Routes>
        {/* Must mirror the app route so useParams resolves :stateCode */}
        <Route path="/dmv/:stateCode" element={<StateGuide />} />
      </Routes>
    </StaticRouter>
  );
}

export function renderPublicPage(path: string): string {
  return renderToString(
    <StaticRouter location={path}>
      <Routes>
        <Route path="/dmv" element={<StateGuideIndex />} />
        <Route path="/about" element={<About />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfUse />} />
        <Route path="/contact" element={<ContactFeedback />} />
      </Routes>
    </StaticRouter>
  );
}
