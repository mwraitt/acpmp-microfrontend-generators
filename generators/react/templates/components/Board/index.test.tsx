import ReactDOM from 'react-dom';
import { Board } from '.';

describe('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Board onClick={() => undefined} squares={[]} />, div);
});
