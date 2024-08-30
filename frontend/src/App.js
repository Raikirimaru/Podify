import { useState, useEffect } from "react";
import styled, { ThemeProvider } from 'styled-components';
import { Toaster } from 'sonner'
import { lightTheme, darkTheme } from './utils/Themes'
import { SideBar } from "./components/SideBar";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { Dashboard } from "./views/Dashboard";
import { Favorite } from "./views/Favorite";
import { DisplayPodcast } from "./views/DisplayPodcast";
import { Profile } from "./views/Profile";
import { Search } from "./views/Search";
import { PodcastDetail } from "./views/PodcastDetail";
import { Upload } from "./components/Upload";
import { SignIn } from "./components/SignIn";
import { VideoPlayer } from "./components/VideoPlayer";
import { AudioPlayer } from "./components/AudioPlayer";
import { useSelector, useDispatch } from "react-redux";
import { SignUp } from "./components/SignUp";
import { closeSignin } from "./redux/setSigninSlice.jsx";
import { ToastMessage } from "./components/ToastMessage.jsx";
import { EditProfile } from "./views/EditProfile.jsx";
import { EpisodeUpload } from "./components/EpisodeUpload.jsx";

const Container = styled.div`
  background: ${({ theme }) => theme.bgLight};
  flex-direction: row;
  width: 100%;
  height: 100vh;
  display: flex;
  overflow-x: hidden;
  overflow-y: hidden;
`

const Frame = styled.div`
  display: flex;
  flex-direction: column;
  flex: 3;
`;

function App() {
  const [darkmode, setDarkmode] = useState(true)
  const [menuOpen, setMenuOpen] = useState(true)
  const { open, message, severity } = useSelector((state) => state.snackbar)
  const { openplayer, type, episode, podid, currentTime, index } = useSelector((state) => state.audioplayer)
  const { opensi } =  useSelector((state) => state.signin)
  const [SignUpOpen, setSignUpOpen] = useState(false)
  const [SignInOpen, setSignInOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [episodeUploadOpen, setEpisodeUploadOpen] = useState(false)

  const dispatch = useDispatch()
  
    useEffect(() => {
      const resize = () => {
        if (window.innerWidth < 1110) {
          setMenuOpen(false);
        } else {
          setMenuOpen(true);
        }
      }
      resize();
      window.addEventListener("resize", resize);
      return () => window.removeEventListener("resize", resize);
    }, []);

    useEffect(()=>{
      dispatch(
        closeSignin()
      )
    },[dispatch])

  return (
    <ThemeProvider theme={darkmode ? darkTheme : lightTheme}>
      <BrowserRouter>
        {opensi && (
          <SignIn setSignInOpen={setSignInOpen} setSignUpOpen={setSignUpOpen} />
        )}
        {SignUpOpen && (
          <SignUp setSignInOpen={setSignInOpen} setSignUpOpen={setSignUpOpen} />
        )}
        {uploadOpen && <Upload setUploadOpen={setUploadOpen} />}
        {episodeUploadOpen && <EpisodeUpload setEpisodeUploadOpen={setEpisodeUploadOpen} />}
        {openplayer && type === "video" && (
          <VideoPlayer
            episode={episode}
            podid={podid}
            currentTime={currentTime}
            index={index}
          />
        )}
        {openplayer && type === "audio" && (
          <AudioPlayer
            episode={episode}
            podid={podid}
            currentTime={currentTime}
            index={index}
          />
        )}
        <Container>
          {menuOpen && (
            <SideBar
              menuOpen={menuOpen}
              setMenuOpen={setMenuOpen}
              setDarkmode={setDarkmode}
              darkmode={darkmode}
              setUploadOpen={setUploadOpen} 
              setSignInOpen={setSignInOpen}
            />
          )}
          <Frame>
            <NavBar menuOpen={menuOpen} setMenuOpen={setMenuOpen} SignInOpen={SignInOpen} setSignInOpen={setSignInOpen} setSignUpOpen={setSignUpOpen}/>
            <Routes>
              <Route path="/" exact element={<Dashboard setSignInOpen={setSignInOpen}/>} />
              <Route path="/search" exact element={<Search />} />
              <Route path="/favorites" exact element={<Favorite />} />
              <Route path="/profile" exact element={<Profile setUploadOpen={setUploadOpen} setEpisodeUploadOpen={setEpisodeUploadOpen} />} />
              <Route path="/edit-profile" exact element={<EditProfile />} />
              <Route path="/podcast/:id" exact element={<PodcastDetail />} />
              <Route
                path="/podcast/show/:type"
                exact
                element={<DisplayPodcast />}
              />
            </Routes>
          </Frame>
          <Toaster richColors closeButton expand={false} visibleToasts={3} position="bottom-right" />
          {open && <ToastMessage open={open} message={ message } severity={severity} />}
        </Container>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;