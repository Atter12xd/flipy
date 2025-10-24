'use client';

import { useEffect, useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';
import { trackingAPI } from '@/lib/api';

interface MapaTrackingProps {
  envioId: string;
  mostrarControles?: boolean;
}

interface UbicacionData {
  envioId: string;
  estado: string;
  origen: {
    lat: number;
    lng: number;
    direccion: string;
    nombre?: string;
  };
  destino: {
    lat: number;
    lng: number;
    direccion: string;
    nombre?: string;
  };
  ubicacionActual?: {
    lat: number;
    lng: number;
    timestamp: string;
  };
  motorizado?: {
    vehiculo: string;
    licencia: string;
  };
  updatedAt: string;
}

const containerStyle = {
  width: '100%',
  height: '500px'
};

const libraries: ("places")[] = ['places'];

export default function MapaTracking({ envioId, mostrarControles = false }: MapaTrackingProps) {
  const [ubicacionData, setUbicacionData] = useState<UbicacionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mapCenter, setMapCenter] = useState({ lat: -12.0464, lng: -77.0428 }); // Lima por defecto

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: libraries
  });

  const loadUbicacion = useCallback(async () => {
    try {
      setError('');
      const response = await trackingAPI.getUbicacion(envioId);
      
      if (response.success && response.data) {
        setUbicacionData(response.data);
        
        // Centrar en ubicación actual del motorizado o en origen
        if (response.data.ubicacionActual) {
          setMapCenter({
            lat: response.data.ubicacionActual.lat,
            lng: response.data.ubicacionActual.lng
          });
        } else {
          setMapCenter({
            lat: response.data.origen.lat,
            lng: response.data.origen.lng
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar ubicación');
    } finally {
      setLoading(false);
    }
  }, [envioId]);

  useEffect(() => {
    loadUbicacion();

    // Auto-refresh cada 10 segundos
    const interval = setInterval(() => {
      loadUbicacion();
    }, 10000);

    return () => clearInterval(interval);
  }, [loadUbicacion]);

  if (loadError) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error al cargar Google Maps
      </div>
    );
  }

  if (!isLoaded || loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!ubicacionData) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        No hay datos de ubicación disponibles
      </div>
    );
  }

  // Preparar coordenadas para la polilínea
  const pathCoordinates = [
    { lat: ubicacionData.origen.lat, lng: ubicacionData.origen.lng }
  ];

  if (ubicacionData.ubicacionActual) {
    pathCoordinates.push({
      lat: ubicacionData.ubicacionActual.lat,
      lng: ubicacionData.ubicacionActual.lng
    });
  }

  pathCoordinates.push({
    lat: ubicacionData.destino.lat,
    lng: ubicacionData.destino.lng
  });

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Info del estado */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Tracking en Vivo</h3>
            <p className="text-sm opacity-90">
              Estado: {ubicacionData.estado.replace('_', ' ')}
            </p>
          </div>
          {ubicacionData.motorizado && (
            <div className="text-right">
              <p className="text-sm font-semibold">{ubicacionData.motorizado.vehiculo}</p>
              <p className="text-xs opacity-75">{ubicacionData.motorizado.licencia}</p>
            </div>
          )}
        </div>
      </div>

      {/* Mapa */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={14}
        options={{
          zoomControl: mostrarControles,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: mostrarControles,
        }}
      >
        {/* Marcador de Origen (Verde) */}
        <Marker
          position={{ lat: ubicacionData.origen.lat, lng: ubicacionData.origen.lng }}
          icon={{
            url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
            scaledSize: new window.google.maps.Size(40, 40)
          }}
          title={`Origen: ${ubicacionData.origen.direccion}`}
        />

        {/* Marcador de Destino (Rojo) */}
        <Marker
          position={{ lat: ubicacionData.destino.lat, lng: ubicacionData.destino.lng }}
          icon={{
            url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new window.google.maps.Size(40, 40)
          }}
          title={`Destino: ${ubicacionData.destino.direccion}`}
        />

        {/* Marcador de Ubicación Actual del Motorizado (Azul) */}
        {ubicacionData.ubicacionActual && (
          <Marker
            position={{
              lat: ubicacionData.ubicacionActual.lat,
              lng: ubicacionData.ubicacionActual.lng
            }}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              scaledSize: new window.google.maps.Size(50, 50)
            }}
            title="Ubicación actual del motorizado"
            animation={window.google.maps.Animation.BOUNCE}
          />
        )}

        {/* Polilínea de ruta */}
        <Polyline
          path={pathCoordinates}
          options={{
            strokeColor: '#4F46E5',
            strokeOpacity: 0.8,
            strokeWeight: 4,
          }}
        />
      </GoogleMap>

      {/* Info de ubicaciones */}
      <div className="p-4 border-t">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Origen */}
          <div className="flex items-start gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full mt-1"></div>
            <div>
              <p className="text-xs text-gray-500 font-semibold">ORIGEN</p>
              {ubicacionData.origen.nombre && (
                <p className="font-semibold text-gray-800">{ubicacionData.origen.nombre}</p>
              )}
              <p className="text-sm text-gray-600">{ubicacionData.origen.direccion}</p>
            </div>
          </div>

          {/* Destino */}
          <div className="flex items-start gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full mt-1"></div>
            <div>
              <p className="text-xs text-gray-500 font-semibold">DESTINO</p>
              {ubicacionData.destino.nombre && (
                <p className="font-semibold text-gray-800">{ubicacionData.destino.nombre}</p>
              )}
              <p className="text-sm text-gray-600">{ubicacionData.destino.direccion}</p>
            </div>
          </div>
        </div>

        {/* Ubicación actual */}
        {ubicacionData.ubicacionActual && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-blue-600">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <p className="text-sm font-semibold">Motorizado en ruta</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Última actualización: {new Date(ubicacionData.ubicacionActual.timestamp).toLocaleTimeString()}
            </p>
          </div>
        )}

        {/* Auto-refresh indicator */}
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Actualización automática cada 10 segundos</span>
        </div>
      </div>
    </div>
  );
}

