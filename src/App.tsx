import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import naranjaImage from './img/naranja.png';
import limonImage from './img/limon.png';
import backgroundImage from './img/img1.jpg';
import logoImage from './img/img_logo.png';
import './TelevisorComponent.css';

const socket = io('http://192.168.0.172:3000');

const TelevisorComponent: React.FC = () => {
  const [televisorData, setTelevisorData] = useState<any>(null);
  const [tipoFruta, setTipoFruta] = useState<string>('');
  const [kilosProcesadosHoy, setKilosProcesadosHoy] = useState<number>(0);
  const [kilosProcesadosHora, setKilosProcesadosHora] = useState<number>(0);
  const [kilosExportacionHoy, setKilosExportacionHoy] = useState<number>(0);
  const [kilosExportacionHora, setKilosExportacionHora] = useState<number>(0);
  const [rendimiento, setRendimiento] = useState<number>(0);
  const [cronometro, setCronometro] = useState<number>(0);
  const [nombrePredio, setNombrePredio] = useState<string>('');
  const [enf, setEnf] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Enviando solicitud para obtener datos del televisor...");
        socket.emit('Desktop', { data: { action: 'obtenerEF1Sistema', collection: 'variablesDesktop' } }, (response: any) => {
          console.log("Respuesta del servidor (televisor):", response);
          setTelevisorData(response);
          setTipoFruta(response.predioProcesando.tipoFruta);
          setKilosProcesadosHoy(response.kilosProcesadosHoy);
          setKilosProcesadosHora(response.kilosProcesadosHora);
          setKilosExportacionHoy(response.kilosExportacionHoy);
          setKilosExportacionHora(response.kilosExportacionHora);
          setRendimiento(response.rendimiento);
          setNombrePredio(replaceSpecialCharacters(response.predioProcesando.nombrePredio.slice(0, 15))); // Limitar a 15 caracteres y reemplazar caracteres especiales
          setEnf(response.predioProcesando.enf);
          console.log("hola", response.kilosProcesadosHoy);
        });
      } catch (error) {
        console.error("Error al obtener datos del televisor:", error);
      }
    };

    fetchData();

    const timer = setInterval(() => {
      setCronometro(prev => prev + 1);
    }, 1000);

    const currentDate = new Date().toISOString();
    const fechaInicioRequest = {
      data: {
        action: 'fechaInicioProceso',
        fechaInicio: currentDate,
        collection: 'variablesDesktop'
      }
    };
    console.log("Enviando solicitud de fecha inicio:", fechaInicioRequest);
    socket.emit('Desktop', fechaInicioRequest, (response: any) => {
      console.log("Respuesta del servidor (fecha inicio):", response);
    });

    return () => {
      clearInterval(timer);

      const fechaFinRequest = {
        data: {
          action: 'fechaFinProceso',
          fechaFin: new Date().toISOString(),
          collection: 'variablesDesktop'
        }
      };
      console.log("Enviando solicitud de fecha fin:", fechaFinRequest);
      socket.emit('Desktop', fechaFinRequest, (response: any) => {
        console.log("Respuesta del servidor (fecha fin):", response);
      });
    };
  }, []);

  // Función para reemplazar caracteres especiales en el nombre del predio
  const replaceSpecialCharacters = (text: string): string => {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Reemplazar letras con tilde por sus equivalentes sin tilde
  };

  function formatTime(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = remainingSeconds.toString().padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }

  return (
    <div className="televisor-container" style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'contain', backgroundPosition: 'center', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', borderRadius: 10, padding: 12, width: 100, height: 82, display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.25)' }}>
          {tipoFruta === 'Naranja' && <img src={naranjaImage} alt="Naranja" style={{ width: 100, height: 100 }} />}
          {tipoFruta === 'Limon' && <img src={limonImage} alt="Limón" style={{ width: 100, height: 100 }} />}
        </div>
        <div style={{ backgroundColor: '#000', padding: 5, borderRadius: 10, width: 330, marginLeft: 10, height: 100, textAlign: 'center' }}>
    <p style={{ marginTop: 10, fontSize: 90, color: 'red', fontWeight: 'bold', marginLeft: 11, fontFamily: 'DS-Digital', margin: 'auto' }}>{formatTime(cronometro)}</p>
</div>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', borderRadius: 10, padding: 12, width: 100, height: 85, display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.25)', marginLeft: '10px' }}>
          <img src={logoImage} alt="Nueva Imagen" style={{ width: 100, height: 70 }} />
        </div>
      </div>

      <div style={{ display: 'flex', width: '100%', marginTop: '1%', justifyContent: 'center' }}>
        <div style={{ borderRadius: 10, padding: 1, width: '68%', boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.25)', marginRight: '10px', height: 580 }}>
          <div style={{ marginBottom: 5, backgroundColor: 'black', padding: 10, borderRadius: 10, marginTop: -1 }}>
            <p style={{ fontSize: 90, color: 'red', fontWeight: 'bold', fontFamily: 'DS-Digital', marginTop: -5, marginBottom: 0 }}>
              <span style={{ fontWeight: 'bold' }}>{enf}</span>
            </p>
          </div>
          <div style={{ marginBottom: 5, backgroundColor: 'black', padding: 10, borderRadius: 10 }}>
            <p style={{ fontSize: 90, color: 'red', fontWeight: 'bold', fontFamily: 'DS-Digital', marginTop: -5, marginBottom: 0 }}>
              <span style={{ fontWeight: 'bold' }}>{nombrePredio}</span>
            </p>
          </div>
          <div style={{ marginBottom: 5, backgroundColor: 'black', padding: 10, borderRadius: 10 }}>
            <p style={{ fontSize: 90, color: 'red', fontWeight: 'bold', fontFamily: 'DS-Digital', marginTop: -5, marginBottom: 0 }}>
              <span style={{ fontWeight: 'bold' }}>Procesados:<br /></span> {kilosProcesadosHoy.toFixed(0)} KG
            </p>
          </div>
          <div style={{ backgroundColor: 'black', padding: 10, borderRadius: 10 }}>
            <p style={{ fontSize: 90, color: 'red', fontWeight: 'bold', fontFamily: 'DS-Digital', marginTop: -5, marginBottom: -7 }}>
              <span style={{ fontWeight: 'bold' }}>Exportacion:<br /></span>{kilosExportacionHoy.toFixed(0)} KG
            </p>
          </div>
        </div>
        <div style={{ borderRadius: 10, padding: 16, marginBottom: 20, width: '69%', backgroundColor: '#000', boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.25)' }}>
          <p style={{ fontSize: 75, marginBottom: 12, color: 'red', fontWeight: 'bold', fontFamily: 'DS-Digital', marginTop: -3, }}><span style={{ fontWeight: 'bold' }}>Rendimiento:</span> {rendimiento.toFixed(0) || 0}%</p>
          <div style={{ borderRadius: 5, height: 50, marginBottom: 10, overflow: 'hidden', backgroundColor: '#f2f2f2' }}>
            <div style={{ height: '100%', width: `${Math.min(rendimiento || 0, 100)}%`, backgroundColor: Math.min(rendimiento || 0, 100) > 70 ? 'green' : 'red', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: 20 }}>{`${Math.min(rendimiento || 0, 100).toFixed(0)}%`}</span>
            </div>
          </div>
          <p style={{ fontSize: 74, marginBottom: 12, color: 'red', fontWeight: 'bold', fontFamily: 'DS-Digital', marginTop: 10 }}><span style={{ fontWeight: 'bold' }}>Procesados:<br /></span> {kilosProcesadosHora.toFixed(0)} KG/HORA</p>
          <div style={{ borderRadius: 5, height: 50, marginBottom: 10, overflow: 'hidden', backgroundColor: '#f2f2f2' }}>
            <div style={{ height: '100%', width: `${(kilosProcesadosHora / 100) * 100}%`, backgroundColor: (kilosProcesadosHora / 100) * 100 > 70 ? 'green' : '#FF0000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: 20 }}>{`${kilosProcesadosHora.toFixed(0)} kg`}</span>
            </div>
          </div>
          <p style={{ fontSize: 74, marginBottom: 12, color: 'red', fontWeight: 'bold', fontFamily: 'DS-Digital', marginTop: 10 }}><span style={{ fontWeight: 'bold' }}>Exportacion:<br /></span> {kilosExportacionHora.toFixed(0)} KG/HORA</p>
          <div style={{ borderRadius: 5, height: 50, marginBottom: 10, overflow: 'hidden', backgroundColor: '#f2f2f2' }}>
            <div style={{ height: '100%', width: `${(kilosExportacionHora / 100) * 100}%`, backgroundColor: (kilosExportacionHora / 100) * 100 > 70 ? 'green' : '#FF0000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: 20 }}>{`${kilosExportacionHora.toFixed(0)} kg`}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TelevisorComponent;