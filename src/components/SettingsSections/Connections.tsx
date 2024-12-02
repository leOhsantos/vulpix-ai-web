import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Button } from "../Button";
import { Input } from "../Input";
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import CircularProgress from '@mui/material/CircularProgress';
import axios from "axios";
import UseAuth from "../../hooks/useAuth";

interface Connections {
    isLoading: boolean,
    setLoading: Dispatch<SetStateAction<boolean>>,
    setMessage: Dispatch<SetStateAction<string>>,
    openSuccessModal: () => void,
    openErrorModal: () => void
}

interface ConnectionData {
    media: string,
    accessToken: string,
    clientId: string,
    clientSecret: string,
    igUserId: string
}

export function Connections({ isLoading, setLoading, setMessage, openSuccessModal, openErrorModal }: Connections) {
    const { setMediaConnected }: any = UseAuth();

    const [connectionData, setConnectionData] = useState<Partial<ConnectionData>>({});
    const [isConnectionFormCompleted, setConnectionFormCompleted] = useState<boolean>(false);

    useEffect(() => {
        if (connectionData.media && connectionData.accessToken && connectionData.clientId && connectionData.clientSecret && connectionData.igUserId) {
            setConnectionFormCompleted(true);
        } else {
            setConnectionFormCompleted(false);
        }
    }, [connectionData]);

    async function sendConnectionForm() {
        const postPayload = {
            tipo: connectionData.media
        }

        const patchPayload = {
            accessToken: connectionData.accessToken,
            clientId: connectionData.clientId,
            clientSecret: connectionData.clientSecret,
            igUserId: connectionData.igUserId
        }

        setLoading(true);

        await axios.post(`${import.meta.env.VITE_API_URL}/integracoes`, postPayload, {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("bearerToken")}`
            }
        }).then(() => {
            axios.patch(`${import.meta.env.VITE_API_URL}/integracoes`, patchPayload, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("bearerToken")}`
                }
            }).then(() => {
                sessionStorage.setItem("mediaConnected", "true");
                setMediaConnected(true);
                setMessage("Conexão realizada com sucesso! 🚀");
                openSuccessModal();
            }).catch(() => {
                setMessage("Houve um problema ao realizar a conexão.");
                openErrorModal();
            });
        }).catch(() => {
            setMessage("Houve um problema ao realizar a conexão.");
            openErrorModal();
        });

        setLoading(false);
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-between">
            <h2 className="text-center">Escolha uma rede, preencha os campos e, ao se conectar, você poderá fazer publicações através da nossa plataforma! 🚀</h2>

            <div className="flex mt-[8px] select-none">
                <button
                    onClick={() => setConnectionData((prevData: any) => ({ ...prevData, media: "INSTAGRAM" }))}
                    className={`flex items-center py-2 px-3 mr-2 rounded-md border-solid border-2 transition-all ${connectionData.media == "INSTAGRAM" ? "text-purple border-purple" : "border-white-gray"}`}
                    disabled={isLoading ? true : false}
                >
                    <InstagramIcon />
                    <span className="ml-2">Instagram</span>
                </button>

                <button
                    onClick={() => setConnectionData((prevData: any) => ({ ...prevData, media: "FACEBOOK" }))}
                    className={`flex items-center py-2 px-3 ml-2 rounded-md border-solid border-2 transition-all ${connectionData.media == "FACEBOOK" ? "text-purple border-purple" : "border-white-gray"}`}
                    disabled={isLoading ? true : false}
                >
                    <FacebookIcon />
                    <span className="ml-2">Facebook</span>
                </button>
            </div>

            <div className="w-full mt-4">
                <Input.Modal
                    value={connectionData.accessToken || null}
                    placeholder="Token de Acesso*"
                    type="text"
                    onChange={(e: any) => setConnectionData((prevData: any) => ({ ...prevData, accessToken: e.target.value }))}
                    disabled={isLoading ? true : false}
                />
            </div>

            <div className="w-full mt-4">
                <Input.Modal
                    value={connectionData.clientId || null}
                    placeholder="Id do Cliente*"
                    type="text"
                    onChange={(e: any) => setConnectionData((prevData: any) => ({ ...prevData, clientId: e.target.value }))}
                    disabled={isLoading ? true : false}
                />
            </div>

            <div className="w-full mt-4">
                <Input.Modal
                    value={connectionData.clientSecret || null}
                    placeholder="Secret do Cliente*"
                    type="text"
                    onChange={(e: any) => setConnectionData((prevData: any) => ({ ...prevData, clientSecret: e.target.value }))}
                    disabled={isLoading ? true : false}
                />
            </div>

            <div className="w-full my-4">
                <Input.Modal
                    value={connectionData.igUserId || null}
                    placeholder="Id de Usuário*"
                    type="text"
                    onChange={(e: any) => setConnectionData((prevData: any) => ({ ...prevData, igUserId: e.target.value }))}
                    disabled={isLoading ? true : false}
                />
            </div>

            <div className="flex items-end justify-end w-full">
                <Button.Purple onClick={sendConnectionForm} type="button" width="w-44" disabled={(isConnectionFormCompleted && !isLoading) ? false : true}>
                    {isLoading
                        ? <CircularProgress size="24px" sx={{ color: "#ffffff", marginLeft: "1px" }} />
                        : "Salvar Alterações"
                    }
                </Button.Purple>
            </div>
        </div>
    )
}