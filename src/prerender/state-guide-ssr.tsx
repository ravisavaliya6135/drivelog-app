import { renderToString } from 'react-dom/server';
import { StaticRouter, Routes, Route } from 'react-router';
import { StateGuide } from '../pages/StateGuide';
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
