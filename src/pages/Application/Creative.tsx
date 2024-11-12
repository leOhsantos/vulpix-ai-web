import { useState, FormEvent } from "react";
import { Skeleton, TextareaAutosize, Tooltip } from "@mui/material";
import { Menu } from "../../components/Menu";
import { TypeAnimation } from 'react-type-animation';
import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { useNavigate } from "react-router-dom";
import useTimer from "../../hooks/useTimer";
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CircularProgress from '@mui/material/CircularProgress';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { ThemeProvider } from '@mui/material/styles';
import { calendarTheme } from "../../styles/calendarTheme";
import dayjs, { Dayjs } from "dayjs";
import 'dayjs/locale/pt-br';
import axios from "axios";

interface ImageResponse {
    image1: string,
    image2: string,
    image3: string,
    image4: string
}

export default function Creative() {
    const navigate = useNavigate();
    const { minutes, seconds, startTimer, resetTimer } = useTimer();

    const interactiveMessages = ["O que sua imaginação está pedindo agora?", "Pronto para criar algo incrível?", "O que vamos criar juntos hoje?", "Ideia na cabeça? Vamos transformar em imagem!", "Qual é o projeto da vez?", "Digite sua ideia... Vamos criar!"];
    const validInputRegex = /^(?!\s*$)(?!\s).+/;

    const [step, setStep] = useState<number>(1);

    const [images, setImages] = useState<Partial<ImageResponse>>({});
    const [prompt, setPrompt] = useState<string>("");
    const [userRequest, setUserRequest] = useState<string>("");
    const [isSubmit, setSubmit] = useState<boolean>(false);
    const [isGenerating, setGenerating] = useState<boolean>(false);
    const [selectedImage, setSelectedImage] = useState<string>("");

    const [caption, setCaption] = useState<string>("");
    const [isRequestingCaptionApi, setRequestingCaptionApi] = useState<boolean>(false);
    const [isGeneratingCaption, setGeneratingCaption] = useState<boolean>(false);

    const [isPublishing, setPublishing] = useState<boolean>(false);

    const [isSuccessModalOpen, setSuccessModalOpen] = useState<boolean>(false);
    const openSuccessModal = () => setSuccessModalOpen(true);
    const closeSuccessModal = () => { navigate("/post"), setSuccessModalOpen(false) }

    const [isErrorModalOpen, setErrorModalOpen] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const openErrorModal = () => setErrorModalOpen(true);
    const closeErrorModal = () => setErrorModalOpen(false);

    const [isSchedulingModalOpen, setSchedulingModalOpen] = useState<boolean>(false);
    const openSchedulingModal = () => setSchedulingModalOpen(true);
    const closeSchedulingModal = () => setSchedulingModalOpen(false);
    const [scheduledDate, setScheduleDate] = useState<Dayjs | null>(null);
    const [scheduledTime, setScheduleTime] = useState<Dayjs | null>(null);

    function formatCaption(caption: string) {
        let formattedCaption = caption;
        if (formattedCaption.substring(0, 3) == "## ") formattedCaption = caption.substring(3);
        return formattedCaption.replace("*", "");
    }

    async function generateImage(event: FormEvent) {
        event.preventDefault();

        if (!validInputRegex.test(prompt)) return;

        startTimer();
        setPrompt("");
        setSubmit(true);
        setGenerating(true);

        const payload = {
            userRequest: prompt
        }

        await axios.post(`${import.meta.env.VITE_API_URL}/posts/gerar-post`, payload, {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("bearerToken")}`
            }
        })
            .then(response => {
                setImages({
                    image1: response.data.imagem1,
                    image2: response.data.imagem2,
                    image3: response.data.imagem3,
                    image4: response.data.imagem4
                });
                setCaption(formatCaption(response.data.legenda));
                setGenerating(false);
            })
            .catch(() => {
                setSubmit(false);
                setGenerating(false);
                setUserRequest("");
                setErrorMessage("Houve um problema ao gerar a imagem.");
                openErrorModal();
            });

        resetTimer();
    }

    async function generateCaption() {
        setCaption("");
        setRequestingCaptionApi(true);
        setGeneratingCaption(true);

        const payload = {
            userRequest: userRequest
        }

        await axios.post(`${import.meta.env.VITE_API_URL}/posts/gerar-legenda`, payload, {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("bearerToken")}`
            }
        })
            .then(response => {
                setCaption(formatCaption(response.data.legenda));
                setRequestingCaptionApi(false);
            })
            .catch(() => {
                setRequestingCaptionApi(false);
                setGeneratingCaption(false);
                setErrorMessage("Houve um problema ao gerar a legenda.");
                openErrorModal();
            });
    }

    async function publish() {
        setPublishing(true);

        const payload = {
            image_url: selectedImage,
            caption: caption
        }

        await axios.post(`${import.meta.env.VITE_API_URL}/posts`, payload, {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("bearerToken")}`
            }
        }).then(() => {
            setPublishing(false);
            openSuccessModal();
        }).catch(() => {
            setPublishing(false);
            setErrorMessage("Houve um problema ao realizar a publicação.");
            openErrorModal();
        });
    }

    const setPreviousStep = () => step > 1 && setStep(step => step - 1);
    const setNextStep = () => step < 3 && setStep(step => step + 1);

    return (
        <Menu>
            <div className="flex items-center flex-col h-screen">
                <div className={`fixed top-[50%] -translate-y-[50%] pt-16 ${isSubmit && "-mt-48"} ${step == 1 ? "translate-x-0 opacity-100 ease-in-out duration-700" : "translate-x-60 opacity-0 pointer-events-none"}`}>
                    <h1 className={`text-white-gray text-3xl font-medium mb-6 ${isSubmit && "hidden"} text-center`}>
                        <TypeAnimation
                            sequence={[interactiveMessages[Math.floor(Math.random() * interactiveMessages.length)]]}
                            speed={70}
                            repeat={1}
                            cursor={false}
                        />
                    </h1>

                    <form onSubmit={generateImage} className="relative flex items-center w-[1220px] mb-8 py-2 bg-dark-gray rounded-2xl">
                        <TextareaAutosize
                            className="outline-none w-[95%] rounded-xl bg-dark-gray p-2 pl-4 text-blue-gray placeholder:text-zinc-500 resize-none placeholder:select-none"
                            maxRows={3} placeholder="Digite aqui seu prompt..."
                            onChange={(e) => { setPrompt(e.target.value), setUserRequest(e.target.value) }}
                            value={prompt}
                            disabled={isGenerating ? true : false}
                            onKeyDown={(e: any) => {
                                if (e.key === 'Enter') {
                                    if (e.shiftKey) {
                                        return;
                                    } else {
                                        e.preventDefault();
                                        e.target.form.requestSubmit();
                                    }
                                }
                            }}
                            autoFocus
                        />
                        <div className="absolute right-3 bottom-2">
                            {validInputRegex.test(userRequest)
                                ? <button type="submit" className="flex items-center justify-center w-10 h-10 text-white-gray bg-purple rounded-xl hover:bg-purple-dark transition-all disabled:hover:bg-purple" disabled={isGenerating ? true : false}>
                                    {isGenerating
                                        ? <CircularProgress size="18px" sx={{ color: "#ffffff", marginLeft: "1px" }} />
                                        : <AutoAwesomeOutlinedIcon />
                                    }
                                </button>
                                : <Tooltip title="Seu prompt está vazio" placement="top">
                                    <span>
                                        <button type="button" className="flex items-center justify-center w-10 h-10 text-white-gray bg-purple rounded-xl disabled:opacity-70" disabled>
                                            <AutoAwesomeOutlinedIcon />
                                        </button>
                                    </span>
                                </Tooltip>
                            }
                        </div>
                    </form>
                </div>

                <div className={`absolute flex flex-col pt-16 ${isSubmit ? "opacity-100 top-[50%] -translate-y-[50%] ease-in-out duration-700 delay-150" : "opacity-0 pointer-events-none"} ${step >= 2 && "translate-x-60 !opacity-0 transition-none"}`}>
                    {isGenerating
                        ?
                        <>
                            <div className="flex">
                                <Skeleton
                                    sx={{ bgcolor: '#222222', borderRadius: "1rem", margin: "0 16px" }}
                                    variant="rectangular"
                                    width={280}
                                    height={240}
                                />

                                <Skeleton
                                    sx={{ bgcolor: '#222222', borderRadius: "1rem", margin: "0 16px" }}
                                    variant="rectangular"
                                    width={280}
                                    height={240}
                                />

                                <Skeleton
                                    sx={{ bgcolor: '#222222', borderRadius: "1rem", margin: "0 16px" }}
                                    variant="rectangular"
                                    width={280}
                                    height={240}
                                />

                                <Skeleton
                                    sx={{ bgcolor: '#222222', borderRadius: "1rem", margin: "0 16px" }}
                                    variant="rectangular"
                                    width={280}
                                    height={240}
                                />
                            </div>
                            <div className="absolute -bottom-24 w-full flex items-center justify-between px-6 text-white-gray">
                                <h3 className="text-xl font-medium text-left">Isso pode demorar um pouco, pegue um café enquanto isso... ☕</h3>
                                <span className="text-xl pr-2 flex items-center justify-center select-none">
                                    <AccessTimeIcon sx={{ marginRight: "4px", color: "#5d5aff" }} />
                                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                                </span>
                            </div>
                        </>
                        :
                        <div>
                            <div className="flex">
                                <button className="mx-4" onClick={(e: any) => setSelectedImage(e.target.src)}>
                                    <img className={`w-[280px] h-[240px] rounded-2xl border-4 border-solid ${images.image1 == selectedImage ? "border-purple" : "border-transparent"}`} src={images.image1} />
                                </button>

                                <button className="mx-4" onClick={(e: any) => setSelectedImage(e.target.src)}>
                                    <img className={`w-[280px] h-[240px] rounded-2xl border-4 border-solid ${images.image2 == selectedImage ? "border-purple" : "border-transparent"}`} src={images.image2} />
                                </button>

                                <button className="mx-4" onClick={(e: any) => setSelectedImage(e.target.src)}>
                                    <img className={`w-[280px] h-[240px] rounded-2xl border-4 border-solid ${images.image3 == selectedImage ? "border-purple" : "border-transparent"}`} src={images.image3} />
                                </button>

                                <button className="mx-4" onClick={(e: any) => setSelectedImage(e.target.src)}>
                                    <img className={`w-[280px] h-[240px] rounded-2xl border-4 border-solid ${images.image4 == selectedImage ? "border-purple" : "border-transparent"}`} src={images.image4} />
                                </button>
                            </div>

                            <div className="absolute -bottom-24 w-full flex items-center justify-between px-6">
                                <h3 className="text-white-gray text-xl font-medium text-center">Escolha a imagem que você mais gostou! 👀</h3>
                                <Button.Purple onClick={() => selectedImage && setNextStep()} width="w-52">Confirmar</Button.Purple>
                            </div>
                        </div>
                    }
                </div>
            </div>

            {/* Step 2 Screen */}

            <div className={`flex items-center justify-center flex-col fixed top-[50%] -translate-y-[50%] h-full w-full pt-16 pb-6 ${step == 2 ? "translate-x-0 opacity-100 ease-in-out duration-700" : "translate-x-60 opacity-0 pointer-events-none"}`}>
                <h3 className="text-white-gray text-2xl font-medium text-center">Agora, confirme a legenda para prosseguir com a publicação! ✅</h3>

                {isRequestingCaptionApi
                    ?
                    <Skeleton
                        sx={{ bgcolor: '#222222', borderRadius: "1rem", margin: "32px 0" }}
                        variant="rectangular"
                        width={750}
                        height={288}
                    />
                    :
                    caption && isGeneratingCaption
                        ?
                        <div className="w-[750px] h-72 flex items-center justify-center rounded-2xl my-8 p-12 bg-dark-gray text-white-gray">
                            <TypeAnimation
                                key={step}
                                sequence={[caption, () => setGeneratingCaption(false)]}
                                speed={90}
                                repeat={1}
                                cursor={false}
                            />
                        </div>
                        :
                        <div className="w-[750px] h-72 flex items-center justify-center rounded-2xl my-8 p-12 bg-dark-gray text-white-gray">
                            <p>{caption}</p>
                        </div>
                }

                <div className="flex">
                    <span className="mr-3"><Button.Transparent onClick={() => setPreviousStep()} width="w-52" disabled={isGeneratingCaption ? true : false}>Voltar</Button.Transparent></span>
                    <Button.Purple onClick={() => setNextStep()} width="w-52" disabled={isGeneratingCaption ? true : false}>Confirmar</Button.Purple>
                </div>

                <div className="flex items-center justify-center mt-8">
                    <p className="text-white-gray h-6 w-[664px] text-lg font-medium">Caso não tenha gostado dessa legenda, clique no botão ao lado para gerar outra:</p>

                    <button onClick={generateCaption} type="button" className="flex items-center justify-center w-10 h-10 text-white-gray bg-purple rounded-xl hover:bg-purple-dark transition-all disabled:hover:bg-purple" disabled={isGeneratingCaption ? true : false}>
                        {isGeneratingCaption
                            ? <CircularProgress size="18px" sx={{ color: "#ffffff", marginLeft: "1px" }} />
                            : <AutoAwesomeOutlinedIcon />
                        }
                    </button>
                </div>
            </div>

            {/* Step 3 Screen */}

            <div className={`flex items-center justify-center flex-col fixed top-[50%] -translate-y-[50%] h-full w-full pt-16 pb-6 ${step == 3 ? "translate-x-0 opacity-100 ease-in-out duration-700" : "translate-x-60 opacity-0 pointer-events-none"}`}>
                <h3 className="text-white-gray text-2xl font-medium text-center">✨ Está quase lá! Antes de publicar, veja como sua publicação vai ficar! ✨</h3>

                <div className="flex items-center justify-center my-12 bg-dark-gray rounded-2xl pr-6">
                    <img className="w-[340px] h-[300px] rounded-2xl" src={selectedImage} />
                    <p className="ml-8 text-white-gray w-[460px]">{caption}</p>
                </div>

                <div className="flex">
                    <span className="mr-3"><Button.Transparent onClick={() => setPreviousStep()} width="w-52" disabled={isPublishing ? true : false}>Voltar</Button.Transparent></span>
                    <Button.Purple onClick={publish} width="w-52" disabled={isPublishing ? true : false}>
                        {isPublishing
                            ? <CircularProgress size="18px" sx={{ color: "#ffffff", marginLeft: "1px" }} />
                            : "Publicar"
                        }
                    </Button.Purple>
                    <span className="ml-3"><Button.Transparent width="w-52" onClick={openSchedulingModal}>Agendar Publicação</Button.Transparent></span>
                </div>
            </div>

            <h6 className="fixed bottom-2 text-white-gray text-xs">A vulpix.AI pode cometer erros. É sempre aconselhável revisar informações essenciais.</h6>

            <Modal.Info children="Sua publicação foi enviada com sucesso! 🚀" onConfirm={closeSuccessModal} isOpen={isSuccessModalOpen} onClose={closeSuccessModal} />
            <Modal.Error children={errorMessage} onConfirm={closeErrorModal} isOpen={isErrorModalOpen} onClose={closeErrorModal} />

            {/* Publishing Scheduling Modal */}

            <Modal.Dialog title="Agendar Publicação" onConfirm={closeSchedulingModal} isOpen={isSchedulingModalOpen} onClose={closeSchedulingModal} width={520}>
                <div className="flex flex-col justify-center items-center w-full">
                    <h4 className="mb-8">📆 Quer agendar sua publicação? Escolha o dia e hora! 🚀</h4>
                    <div className="flex">
                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
                            <ThemeProvider theme={calendarTheme}>
                                <DesktopDatePicker
                                    onChange={(date: Dayjs | null) => setScheduleDate(date)}
                                    minDate={dayjs()}
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            color: '#c3d1dc'
                                        },
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#5d5aff'
                                        },
                                        '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#5d5aff'
                                        },
                                        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#5d5aff'
                                        },
                                        '& .MuiOutlinedInput-root.Mui-focused': {
                                            boxShadow: 'none'
                                        },
                                        '& .MuiIconButton-root': {
                                            color: '#5d5aff'
                                        },
                                        width: "166px",
                                        marginRight: "8px"
                                    }} />
                            </ThemeProvider>
                        </LocalizationProvider>

                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
                            <TimePicker
                                onChange={(time: Dayjs | null) => setScheduleTime(time)}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        color: '#c3d1dc'
                                    },
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#5d5aff'
                                    },
                                    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#5d5aff'
                                    },
                                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#5d5aff'
                                    },
                                    '& .MuiOutlinedInput-root.Mui-focused': {
                                        boxShadow: 'none'
                                    },
                                    '& .MuiIconButton-root': {
                                        color: '#5d5aff'
                                    },
                                    width: "166px",
                                    marginLeft: "8px"
                                }} />
                        </LocalizationProvider>
                    </div>
                </div>
            </Modal.Dialog>
        </Menu>
    )
}