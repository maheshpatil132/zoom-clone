import Home from "./Home";

import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Meet from "./Meet";


function App() {
  

  return (
    <Router>
    <div>
      <Routes>
        <Route path="/" element={<Home/>}></Route>
        <Route path='/:name/:room' element={<Meet/>}></Route>
      </Routes>
     
    </div>
    </Router>
  );
}

export default App;
