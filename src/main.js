import './styles/fonts.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/views.css';
import { startApp } from './app.js';

startApp().catch(err => {
  console.error(err);
  document.getElementById('app').innerHTML =
    '<p style="padding:24px;font-family:system-ui">Oups, l\'application n\'a pas pu démarrer. Recharge la page.</p>';
});
