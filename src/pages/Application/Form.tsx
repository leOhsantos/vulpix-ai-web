import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { useNavigate } from "react-router-dom";
import { LoadingScreen } from "../../components/LoadingScreen";
import { Modal } from "../../components/Modal";
import CircularProgress from '@mui/material/CircularProgress';
import UseAuth from "../../hooks/useAuth";
import axios from "axios";
import NotFound from "../NotFound";

const stepOneFormSchema = z.object({
    slogan: z.string().nullable(),
    descricao: z.string().min(1, "Campo obrigatório"),
    setor: z.string().min(1, "Campo obrigatório"),
    anoFundacao: z.string().min(1, "Campo obrigatório"),
    logotipo: z.string().min(1, "Campo obrigatório")
});

const stepTwoFormSchema = z.object({
    corPrimaria: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Hexadecimal inválido"),
    corSecundaria: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Hexadecimal inválido"),
    fonte: z.string().min(1, "Campo obrigatório"),
    estiloVisual: z.string().min(1, "Campo obrigatório"),
    publicoAlvo: z.string().min(1, "Campo obrigatório"),
    problemasQueResolve: z.string().min(1, "Campo obrigatório")
});

const stepThreeFormSchema = z.object({
    expectativaDoCliente: z.string().min(1, "Campo obrigatório"),
    produtoEmpresa: z.string().min(1, "Campo obrigatório"),
    diferencialSolucao: z.string().min(1, "Campo obrigatório"),
    concorrentes: z.string().min(1, "Campo obrigatório"),
    pontosFortes: z.string().min(1, "Campo obrigatório")
});

const stepFourFormSchema = z.object({
    desafiosEnfrentados: z.string().min(1, "Campo obrigatório"),
    redesSociais: z.string().min(1, "Campo obrigatório"),
    tonalidadeComunicacao: z.string().min(1, "Campo obrigatório"),
    tiposConteudo: z.string().min(1, "Campo obrigatório"),
    objetivoMarketing: z.string().min(1, "Campo obrigatório")
});

const stepFiveFormSchema = z.object({
    resultadosEsperados: z.string().min(1, "Campo obrigatório"),
    datasImportantes: z.string().min(1, "Campo obrigatório"),
    estiloCriativos: z.string().min(1, "Campo obrigatório"),
    referenciasVisuais: z.string().min(1, "Campo obrigatório"),
    observacoesGerais: z.string().nullable()
});

type stepOneFormData = z.infer<typeof stepOneFormSchema>
type stepTwoFormData = z.infer<typeof stepTwoFormSchema>
type stepThreeFormData = z.infer<typeof stepThreeFormSchema>
type stepFourFormData = z.infer<typeof stepFourFormSchema>
type stepFiveFormData = z.infer<typeof stepFiveFormSchema>

export default function Form() {
    const navigate = useNavigate();
    const { userData, setUserData }: any = UseAuth();

    const [step, setStep] = useState<number>(0);
    const [formData, setFormData] = useState<object[] | any>([]);
    const [isCorrectStatus, setCorrectStatus] = useState<boolean>(false);
    const [showLoadingScreen, setLoadingScreen] = useState<boolean>(true);

    useEffect(() => {
        userData.status == "AGUARDANDO_FORMULARIO" && setCorrectStatus(true);
        setTimeout(() => setLoadingScreen(false), 3000);

        registerStepTwo('corPrimaria').onChange({ target: { name: "corPrimaria", value: "" } })
        registerStepTwo('corSecundaria').onChange({ target: { name: "corSecundaria", value: "" } })
    }, []);

    const [isSuccessModalOpen, setSuccessModalOpen] = useState<boolean>(false);
    const openSuccessModal = () => setSuccessModalOpen(true);
    const closeSuccessModal = () => { setSuccessModalOpen(false), navigate("/creative") }

    const [isErrorModalOpen, setErrorModalOpen] = useState<boolean>(false);
    const openErrorModal = () => setErrorModalOpen(true);
    const closeErrorModal = () => setErrorModalOpen(false);

    const {
        register: registerStepOne,
        handleSubmit: handleSubmitStepOne,
        watch: watchStepOne,
        formState: { errors: stepOneErrors }
    } = useForm<stepOneFormData>({ resolver: zodResolver(stepOneFormSchema) });

    const {
        register: registerStepTwo,
        handleSubmit: handleSubmitStepTwo,
        watch: watchStepTwo,
        formState: { errors: stepTwoErrors }
    } = useForm<stepTwoFormData>({ resolver: zodResolver(stepTwoFormSchema) });

    const {
        register: registerStepThree,
        handleSubmit: handleSubmitStepThree,
        watch: watchStepThree,
        formState: { errors: stepThreeErrors }
    } = useForm<stepThreeFormData>({ resolver: zodResolver(stepThreeFormSchema) });

    const {
        register: registerStepFour,
        handleSubmit: handleSubmitStepFour,
        watch: watchStepFour,
        formState: { errors: stepFourErrors }
    } = useForm<stepFourFormData>({ resolver: zodResolver(stepFourFormSchema) });

    const {
        register: registerStepFive,
        handleSubmit: handleSubmitStepFive,
        watch: watchStepFive,
        formState: { errors: stepFiveErrors }
    } = useForm<stepFiveFormData>({ resolver: zodResolver(stepFiveFormSchema) });

    const [isLoading, setLoading] = useState<boolean>(false);

    function setPreviousStep() {
        step > 1 && setStep(step => step - 1);
        setFormData((data: string) => data.slice(0, -1));
    }

    function setNextStep(data: any) {
        step < 5 && setStep(step => step + 1);
        if (step > 0 && step < 5) setFormData([...formData, data]);
    }

    async function sendForm(data: stepFiveFormData) {
        const payload = {
            slogan: formData[0].slogan,
            descricao: formData[0].descricao,
            setor: formData[0].setor,
            anoFundacao: formData[0].anoFundacao,
            logotipo: formData[0].logotipo,
            corPrimaria: formData[1].corPrimaria,
            corSecundaria: formData[1].corSecundaria,
            fonte: formData[1].fonte,
            estiloVisual: formData[1].estiloVisual,
            publicoAlvo: formData[1].publicoAlvo,
            problemasQueResolve: formData[1].problemasQueResolve,
            expectativaDoCliente: formData[2].expectativaDoCliente,
            produtoEmpresa: formData[2].produtoEmpresa,
            diferencialSolucao: formData[2].diferencialSolucao,
            concorrentes: formData[2].concorrentes,
            pontosFortes: formData[2].pontosFortes,
            desafiosEnfrentados: formData[3].desafiosEnfrentados,
            redesSociais: formData[3].redesSociais,
            tonalidadeComunicacao: formData[3].tonalidadeComunicacao,
            tiposConteudo: formData[3].tiposConteudo,
            objetivoMarketing: formData[3].objetivoMarketing,
            resultadosEsperados: data.resultadosEsperados,
            datasImportantes: data.datasImportantes,
            estiloCriativos: data.estiloCriativos,
            referenciasVisuais: data.referenciasVisuais,
            observacoesGerais: data.observacoesGerais
        }

        setLoading(true);

        await axios.post(`${import.meta.env.VITE_API_URL}/empresas/form`, payload, {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("bearerToken")}`
            }
        }).then((res) => {
            if (res.status == 201) {
                setUserData((prevData: object) => ({ ...prevData, status: "CADASTRO_FINALIZADO" }));
                openSuccessModal();
            }
        }).catch(() => {
            openErrorModal();
        });

        setLoading(false);
    }

    return (
        <>
            {isCorrectStatus
                ?
                showLoadingScreen
                    ?
                    <LoadingScreen />
                    :
                    <div className="flex flex-col justify-center items-center h-screen">
                        <div className="flex items-center absolute top-2 left-2 select-none">
                            <img className="h-[4.5rem] pointer-events-none" src="/vulpixai-logo.jpeg" alt="Logo vulpix.AI" />
                            <h4 className="text-2xl text-white ml-[-8px] font-bold">vulpix.<span className="text-purple">AI</span></h4>
                        </div>

                        {step == 0

                            ?

                            <div className="text-white-gray flex flex-col justify-center items-center">
                                <h1 className="text-4xl text-center">Estamos quase lá!</h1>
                                <p className="w-[40rem] text-center my-8">
                                    Reserve alguns minutos para responder a um breve formulário que nos ajudará a entender melhor suas preferências. Assim, ajustaremos nossos serviços para atender exatamente às suas necessidades, garantindo qualidade e eficiência. Será feito apenas uma <span className="font-semibold text-purple">única vez</span>. Clique no botão abaixo e comece agora!
                                </p>
                                <Button.Purple width="w-44" type="button" onClick={() => setNextStep(null)}>Próximo</Button.Purple>
                            </div>

                            :

                            <div className="w-[70%] text-white-gray">
                                <h4 className="mb-4">PASSO {step} DE 5</h4>
                                <h4>Por favor, preencha as informações solicitadas sobre sua empresa. <span className="font-semibold text-purple">Esses dados são essenciais</span> para personalizarmos nossos serviços de forma eficiente e adequada às suas necessidades. Certifique-se de que as informações fornecidas estejam corretas.</h4>

                                {step == 1 &&

                                    <form onSubmit={handleSubmitStepOne(setNextStep)} className="mt-8">
                                        <div className="flex flex-col mt-4">
                                            <Input.Input
                                                value={watchStepOne('slogan')}
                                                placeholder="Qual é o slogan da empresa?"
                                                type="text"
                                                id="inputSlogan"
                                                name="slogan"
                                                register={registerStepOne}
                                            />
                                        </div>

                                        <div className="flex flex-col mt-4">
                                            <Input.Input
                                                value={watchStepOne('descricao')}
                                                placeholder="Descreva brevemente sobre a empresa*"
                                                type="text"
                                                id="inputDescricao"
                                                name="descricao"
                                                register={registerStepOne}
                                            />
                                            {stepOneErrors.descricao && <span className="text-white-gray text-sm ml-3 mt-2">{stepOneErrors.descricao.message}</span>}
                                        </div>

                                        <div className="flex flex-col mt-4">
                                            <Input.Input
                                                value={watchStepOne('setor')}
                                                placeholder="Qual o setor de atuação da empresa?*"
                                                type="text"
                                                id="inputSetor"
                                                name="setor"
                                                register={registerStepOne}
                                            />
                                            {stepOneErrors.setor && <span className="text-white-gray text-sm ml-3 mt-2">{stepOneErrors.setor.message}</span>}
                                        </div>

                                        <div className="flex flex-col mt-4">
                                            <Input.Input
                                                value={watchStepOne('anoFundacao')}
                                                placeholder="Qual o ano de fundação da empresa?*"
                                                type="text"
                                                id="inputAnoFundacao"
                                                name="anoFundacao"
                                                register={registerStepOne}
                                            />
                                            {stepOneErrors.anoFundacao && <span className="text-white-gray text-sm ml-3 mt-2">{stepOneErrors.anoFundacao.message}</span>}
                                        </div>

                                        <div className="flex flex-col mt-4">
                                            <Input.Input
                                                value={watchStepOne('logotipo')}
                                                placeholder="Descreva o visual do logotipo da empresa*"
                                                type="text"
                                                id="inputLogotipo"
                                                name="logotipo"
                                                register={registerStepOne}
                                            />
                                            {stepOneErrors.logotipo && <span className="text-white-gray text-sm ml-3 mt-2">{stepOneErrors.logotipo.message}</span>}
                                        </div>

                                        <div className="flex justify-end mt-8">
                                            <Button.Purple width="w-44" type="submit">Próximo</Button.Purple>
                                        </div>
                                    </form>
                                }

                                {step == 2 &&

                                    <form onSubmit={handleSubmitStepTwo(setNextStep)} className="mt-8">
                                        <div className="flex mt-4">
                                            <div className="flex flex-col mr-4">
                                                <Input.ColorPicker
                                                    label="Cor primária da empresa*"
                                                    labelBg="bg-black"
                                                    value={watchStepTwo("corPrimaria")}
                                                    onChange={(e: any) => registerStepTwo('corPrimaria').onChange({ target: { name: "corPrimaria", value: e } })}
                                                />
                                                {stepTwoErrors.corPrimaria && <span className="text-white-gray text-sm ml-3 mt-2">{stepTwoErrors.corPrimaria.message}</span>}
                                            </div>

                                            <div className="flex flex-col">
                                                <Input.ColorPicker
                                                    label="Cor secundária da empresa*"
                                                    labelBg="bg-black"
                                                    value={watchStepTwo("corSecundaria")}
                                                    onChange={(e: any) => registerStepTwo('corSecundaria').onChange({ target: { name: "corSecundaria", value: e } })}
                                                />
                                                {stepTwoErrors.corSecundaria && <span className="text-white-gray text-sm ml-3 mt-2">{stepTwoErrors.corSecundaria.message}</span>}
                                            </div>
                                        </div>

                                        <div className="flex flex-col mt-4">
                                            <Input.Input
                                                value={watchStepTwo('fonte')}
                                                placeholder="Qual é a fonte utilizada pela empresa?*"
                                                type="text"
                                                id="inputFonte"
                                                name="fonte"
                                                register={registerStepTwo}
                                            />
                                            {stepTwoErrors.fonte && <span className="text-white-gray text-sm ml-3 mt-2">{stepTwoErrors.fonte.message}</span>}
                                        </div>

                                        <div className="flex flex-col mt-4">
                                            <Input.Input
                                                value={watchStepTwo('estiloVisual')}
                                                placeholder="Qual o estilo visual utilizado pela empresa?*"
                                                type="text"
                                                id="inputEstiloVisual"
                                                name="estiloVisual"
                                                register={registerStepTwo}
                                            />
                                            {stepTwoErrors.estiloVisual && <span className="text-white-gray text-sm ml-3 mt-2">{stepTwoErrors.estiloVisual.message}</span>}
                                        </div>

                                        <div className="flex flex-col mt-4">
                                            <Input.Input
                                                value={watchStepTwo('publicoAlvo')}
                                                placeholder="Qual é o público alvo da empresa?*"
                                                type="text"
                                                id="inputPublicoAlvo"
                                                name="publicoAlvo"
                                                register={registerStepTwo}
                                            />
                                            {stepTwoErrors.publicoAlvo && <span className="text-white-gray text-sm ml-3 mt-2">{stepTwoErrors.publicoAlvo.message}</span>}
                                        </div>

                                        <div className="flex flex-col mt-4">
                                            <Input.Input
                                                value={watchStepTwo('problemasQueResolve')}
                                                placeholder="Quais problemas a empresa resolve?*"
                                                type="text"
                                                id="inputProblemasQueResolve"
                                                name="problemasQueResolve"
                                                register={registerStepTwo}
                                            />
                                            {stepTwoErrors.problemasQueResolve && <span className="text-white-gray text-sm ml-3 mt-2">{stepTwoErrors.problemasQueResolve.message}</span>}
                                        </div>

                                        <div className="flex justify-end mt-8">
                                            <div className="flex">
                                                <span className="mr-3"><Button.Transparent width="w-44" type="button" onClick={setPreviousStep}>Voltar</Button.Transparent></span>
                                                <Button.Purple width="w-44" type="submit">Próximo</Button.Purple>
                                            </div>
                                        </div>
                                    </form>
                                }

                                {step == 3 &&

                                    <form onSubmit={handleSubmitStepThree(setNextStep)} className="mt-8">
                                        <div className="flex flex-col mt-4">
                                            <Input.Input
                                                value={watchStepThree('expectativaDoCliente')}
                                                placeholder="Quais são as expectativas do cliente?*"
                                                type="text"
                                                id="inputExpectativaDoCliente"
                                                name="expectativaDoCliente"
                                                register={registerStepThree}
                                            />
                                            {stepThreeErrors.expectativaDoCliente && <span className="text-white-gray text-sm ml-3 mt-2">{stepThreeErrors.expectativaDoCliente.message}</span>}
                                        </div>

                                        <div className="flex flex-col mt-4">
                                            <Input.Input
                                                value={watchStepThree('produtoEmpresa')}
                                                placeholder="Quais são os produtos da empresa?*"
                                                type="text"
                                                id="inputProdutoEmpresa"
                                                name="produtoEmpresa"
                                                register={registerStepThree}
                                            />
                                            {stepThreeErrors.produtoEmpresa && <span className="text-white-gray text-sm ml-3 mt-2">{stepThreeErrors.produtoEmpresa.message}</span>}
                                        </div>

                                        <div className="flex flex-col mt-4">
                                            <Input.Input
                                                value={watchStepThree('diferencialSolucao')}
                                                placeholder="Qual é o diferencial da solução da empresa?*"
                                                type="text"
                                                id="inputDiferencialSolucao"
                                                name="diferencialSolucao"
                                                register={registerStepThree}
                                            />
                                            {stepThreeErrors.diferencialSolucao && <span className="text-white-gray text-sm ml-3 mt-2">{stepThreeErrors.diferencialSolucao.message}</span>}
                                        </div>

                                        <div className="flex flex-col mt-4">
                                            <Input.Input
                                                value={watchStepThree('concorrentes')}
                                                placeholder="Quais são os concorrentes da empresa?*"
                                                type="text"
                                                id="inputConcorrentes"
                                                name="concorrentes"
                                                register={registerStepThree}
                                            />
                                            {stepThreeErrors.concorrentes && <span className="text-white-gray text-sm ml-3 mt-2">{stepThreeErrors.concorrentes.message}</span>}
                                        </div>

                                        <div className="flex flex-col mt-4">
                                            <Input.Input
                                                value={watchStepThree('pontosFortes')}
                                                placeholder="Quais são os pontos fortes da empresa?*"
                                                type="text"
                                                id="inputPontosFortes"
                                                name="pontosFortes"
                                                register={registerStepThree}
                                            />
                                            {stepThreeErrors.pontosFortes && <span className="text-white-gray text-sm ml-3 mt-2">{stepThreeErrors.pontosFortes.message}</span>}
                                        </div>

                                        <div className="flex justify-end mt-8">
                                            <div className="flex">
                                                <span className="mr-3"><Button.Transparent width="w-44" type="button" onClick={setPreviousStep}>Voltar</Button.Transparent></span>
                                                <Button.Purple width="w-44" type="submit">Próximo</Button.Purple>
                                            </div>
                                        </div>
                                    </form>
                                }

                                {step == 4 &&

                                    <form onSubmit={handleSubmitStepFour(setNextStep)} className="mt-8">
                                        <div className="flex flex-col mt-4">
                                            <Input.Input
                                                value={watchStepFour('desafiosEnfrentados')}
                                                placeholder="Quais são os desafios que são enfrentados pela empresa?*"
                                                type="text"
                                                id="inputDesafiosEnfrentados"
                                                name="desafiosEnfrentados"
                                                register={registerStepFour}
                                            />
                                            {stepFourErrors.desafiosEnfrentados && <span className="text-white-gray text-sm ml-3 mt-2">{stepFourErrors.desafiosEnfrentados.message}</span>}
                                        </div>

                                        <div className="flex flex-col mt-4">
                                            <Input.Input
                                                value={watchStepFour('redesSociais')}
                                                placeholder="Quais redes sociais a empresa utiliza?*"
                                                type="text"
                                                id="inputRedesSociais"
                                                name="redesSociais"
                                                register={registerStepFour}
                                            />
                                            {stepFourErrors.redesSociais && <span className="text-white-gray text-sm ml-3 mt-2">{stepFourErrors.redesSociais.message}</span>}
                                        </div>

                                        <div className="flex flex-col mt-4">
                                            <Input.Input
                                                value={watchStepFour('tonalidadeComunicacao')}
                                                placeholder="Qual o tom de comunicação a empresa acredita que mais se alinha ao perfil?*"
                                                type="text"
                                                id="inputTonalidadeComunicacao"
                                                name="tonalidadeComunicacao"
                                                register={registerStepFour}
                                            />
                                            {stepFourErrors.tonalidadeComunicacao && <span className="text-white-gray text-sm ml-3 mt-2">{stepFourErrors.tonalidadeComunicacao.message}</span>}
                                        </div>

                                        <div className="flex flex-col mt-4">
                                            <Input.Input
                                                value={watchStepFour('tiposConteudo')}
                                                placeholder="Quais serão os tipos de conteúdos criados?*"
                                                type="text"
                                                id="inputTiposConteudo"
                                                name="tiposConteudo"
                                                register={registerStepFour}
                                            />
                                            {stepFourErrors.tiposConteudo && <span className="text-white-gray text-sm ml-3 mt-2">{stepFourErrors.tiposConteudo.message}</span>}
                                        </div>

                                        <div className="flex flex-col mt-4">
                                            <Input.Input
                                                value={watchStepFour('objetivoMarketing')}
                                                placeholder="Qual é o objetivo de marketing da empresa?*"
                                                type="text"
                                                id="inputObjetivoMarketing"
                                                name="objetivoMarketing"
                                                register={registerStepFour}
                                            />
                                            {stepFourErrors.objetivoMarketing && <span className="text-white-gray text-sm ml-3 mt-2">{stepFourErrors.objetivoMarketing.message}</span>}
                                        </div>

                                        <div className="flex justify-end mt-8">
                                            <div className="flex">
                                                <span className="mr-3"><Button.Transparent width="w-44" type="button" onClick={setPreviousStep}>Voltar</Button.Transparent></span>
                                                <Button.Purple width="w-44" type="submit">Próximo</Button.Purple>
                                            </div>
                                        </div>
                                    </form>
                                }

                                {step == 5 &&

                                    <form onSubmit={handleSubmitStepFive(sendForm)} className="mt-8">
                                        <div className="flex flex-col mt-4">
                                            <Input.Input
                                                value={watchStepFive('resultadosEsperados')}
                                                placeholder="Quais são os resultados esperados pela empresa?*"
                                                type="text"
                                                id=""
                                                name="resultadosEsperados"
                                                register={registerStepFive}
                                                disabled={isLoading ? true : false}
                                            />
                                            {stepFiveErrors.resultadosEsperados && <span className="text-white-gray text-sm ml-3 mt-2">{stepFiveErrors.resultadosEsperados.message}</span>}
                                        </div>

                                        <div className="flex flex-col mt-4">
                                            <Input.Input
                                                value={watchStepFive('datasImportantes')}
                                                placeholder="Quais datas a empresa considera importante?*"
                                                type="text"
                                                id="inputDatasImportantes"
                                                name="datasImportantes"
                                                register={registerStepFive}
                                                disabled={isLoading ? true : false}
                                            />
                                            {stepFiveErrors.datasImportantes && <span className="text-white-gray text-sm ml-3 mt-2">{stepFiveErrors.datasImportantes.message}</span>}
                                        </div>

                                        <div className="flex flex-col mt-4">
                                            <Input.Input
                                                value={watchStepFive('estiloCriativos')}
                                                placeholder="A empresa tem preferência por qual estilo de imagens?*"
                                                type="text"
                                                id="inputEstiloCriativos"
                                                name="estiloCriativos"
                                                register={registerStepFive}
                                                disabled={isLoading ? true : false}
                                            />
                                            {stepFiveErrors.estiloCriativos && <span className="text-white-gray text-sm ml-3 mt-2">{stepFiveErrors.estiloCriativos.message}</span>}
                                        </div>

                                        <div className="flex flex-col mt-4">
                                            <Input.Input
                                                value={watchStepFive('referenciasVisuais')}
                                                placeholder="Quais são as referências visuais da empresa?*"
                                                type="text"
                                                id="inputReferenciasVisuais"
                                                name="referenciasVisuais"
                                                register={registerStepFive}
                                                disabled={isLoading ? true : false}
                                            />
                                            {stepFiveErrors.referenciasVisuais && <span className="text-white-gray text-sm ml-3 mt-2">{stepFiveErrors.referenciasVisuais.message}</span>}
                                        </div>

                                        <div className="flex flex-col mt-4">
                                            <Input.Input
                                                value={watchStepFive('observacoesGerais')}
                                                placeholder="Algo mais que gostaria de compartilhar para personalizar ainda mais as imagens?"
                                                type="text"
                                                id="inputObservacoesGerais"
                                                name="observacoesGerais"
                                                register={registerStepFive}
                                                disabled={isLoading ? true : false}
                                            />
                                            {stepFiveErrors.observacoesGerais && <span className="text-white-gray text-sm ml-3 mt-2">{stepFiveErrors.observacoesGerais.message}</span>}
                                        </div>

                                        <div className="flex justify-end mt-8">
                                            <div className="flex">
                                                <span className="mr-3"><Button.Transparent width="w-44" type="button" onClick={setPreviousStep} disabled={isLoading ? true : false}>Voltar</Button.Transparent></span>
                                                <Button.Purple width="w-44" type="submit" disabled={isLoading ? true : false}>
                                                    {isLoading
                                                        ? <CircularProgress size="24px" sx={{ color: "#ffffff" }} />
                                                        : "Finalizar"
                                                    }
                                                </Button.Purple>
                                            </div>
                                        </div>
                                    </form>
                                }
                            </div>
                        }
                    </div>
                :
                <NotFound />
            }

            <Modal.Info children="Formulário cadastrado com sucesso!" onConfirm={closeSuccessModal} isOpen={isSuccessModalOpen} onClose={closeSuccessModal} />
            <Modal.Error children="Houve um problema ao cadastrar formulário." onConfirm={closeErrorModal} isOpen={isErrorModalOpen} onClose={closeErrorModal} />
        </>
    )
}