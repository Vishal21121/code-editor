import React, { useState, useRef, useEffect } from "react";
import "monaco-themes/themes/Monokai Bright.json";
import Editor, { loader } from "@monaco-editor/react";
import { Play } from "react-feather";
import { useDispatch, useSelector } from "react-redux";
import ACTIONS from "../../util/Actions";
import { useParams } from "react-router-dom";
import { setProblems } from "../../features/editor/problemSlice";
import { setAccess } from "../../features/accessPermission/accessSlice";
import Avatar from "react-avatar";
import { useDebouncedCallback } from "use-debounce";
import {
  refreshTokens,
  setAccessToken,
} from "../../features/authentication/userDataSlice";
import { languages } from "../../util/languages";
import {
  useLazyGetCodeQuery,
  useUpdateCodeMutation,
} from "../../features/editor/editorApiSlice";

const CodeEditor = ({ handleSubmit }) => {
  const socketio = useSelector((state) => state.socket.socket);
  const { roomId } = useParams();
  const editorRef = useRef(null);
  const [code, setCode] = useState("");
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.userData.userData);
  const userName = userData.data.loggedInUser.username;
  const [readOnly, setReadOnly] = useState(true);
  const accessedUser = useSelector((state) => state.access.access);
  const accessToken = useSelector((state) => state.userData.accessToken);
  const roomInfo = useSelector((state) => state.room.room);
  const [language, setLanguage] = useState("");
  const [version, setVersion] = useState("");
  console.log({ roomId });
  const [getCode] = useLazyGetCodeQuery({ roomId });
  const [updateCode] = useUpdateCodeMutation();

  const sendCode = async (code, language, version) => {
    const body = {
      roomId: roomId,
      code: code,
      language: language,
      version: version,
    };
    try {
      let response = await updateCode(body).unwrap();
      console.log({ response });
    } catch (error) {
      console.log(error);
    }
    console.log(data);
  };
  const debouncedSendCode = useDebouncedCallback(sendCode, 500);

  const viewModeSetter = () => {
    console.log("accessedUser", accessedUser);
    if (userName === accessedUser) {
      setReadOnly(false);
    } else {
      setReadOnly(true);
    }
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    import("monaco-themes/themes/Dracula.json")
      .then((data) => {
        monaco.editor.defineTheme("dracula", data);
      })
      .then((_) => monaco.editor.setTheme("dracula"));
  };

  function handleEditorValidation(markers) {
    // model markers
    console.log(markers);
    let arr = [];
    markers.forEach((marker) => {
      arr.push(marker.message);
    });
    dispatch(setProblems(arr));
  }

  const handleChange = () => {
    socketio.emit(ACTIONS.CODE_CHANGE, {
      code: editorRef.current.getValue(),
      language,
      version,
      roomId,
      userName,
    });
    debouncedSendCode(editorRef.current.getValue(), language, version, true);
  };

  const fetchCode = async () => {
    console.log(roomId);
    const response = await getCode({ roomId: roomId }).unwrap();
    console.log("response got: ", response);
    setCode(response.data.value.code);
    setLanguage(response.data.value.language);
    setVersion(response.data.value.version);
    document.getElementById("select").value = response.data.value.language;
  };

  useEffect(() => {
    viewModeSetter();
    fetchCode();
    if (socketio) {
      socketio.on(ACTIONS.CODE_CHANGE, ({ code, language, version }) => {
        if (userName != accessedUser) {
          console.log({ code });
          setCode(code);
          setLanguage(language);
          setVersion(version);
        }
      });
      socketio.on(ACTIONS.PERMISSION_CHANGE, ({ changedPermissionUser }) => {
        console.log({ changedPermissionUser });
        dispatch(setAccess(changedPermissionUser));
        viewModeSetter();
      });
    }
    return () => {
      socketio?.off(ACTIONS.CODE_CHANGE);
      socketio?.off(ACTIONS.PERMISSION_CHANGE);
    };
  }, [socketio, accessedUser]);

  const langChange = async (e) => {
    console.log(e.target.value);
    const el = languages.find((el) => el.name === e.target.value);
    console.log("version: ", el.version);
    setLanguage(e.target.value);
    setVersion(el.version);
    await sendCode(code, e.target.value, el.version, true);
  };

  return (
    <div className="flex-col">
      <div className="flex bg-[#161a2a] h-12 items-center">
        {accessedUser != userName ? (
          <div className="flex gap-1">
            <p className="text-white mx-4">Permission:</p>
            <Avatar name={accessedUser} size={30} round="14px" />
          </div>
        ) : (
          ""
        )}
        <div className="flex gap-2 items-center mx-2">
          <select
            className="px-4 py-1 rounded-lg text-md outline-none bg-gray-700 text-white text-center"
            onChange={langChange}
            id="select"
          >
            {languages.map(({ name }, i) => (
              <option className="hover:bg-gray-300" key={i}>
                {name}
              </option>
            ))}
          </select>
        </div>
        {/* <Play
          className="absolute right-10 my-[11px] text-white cursor-pointer"
          onClick={() => {
            handleSubmit(editorRef.current.getValue(), language, version);
          }}
        /> */}
      </div>
      <Editor
        width="50vw"
        value={code}
        defaultLanguage={language}
        onValidate={handleEditorValidation}
        onMount={handleEditorDidMount}
        onChange={handleChange}
        language={language}
        options={{
          wordWrap: true,
          codeLens: true,
          dragAndDrop: false,
          mouseWheelZoom: true,
          readOnly: readOnly,
        }}
      />
    </div>
  );
};

export default CodeEditor;
