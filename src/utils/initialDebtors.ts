import type { ClientDebtor } from '../types/navigation';

export const INITIAL_DEBTORS: ClientDebtor[] = [
  {
    id: 'deb-1',
    nombre: 'SR QUE SE APRECE A AHIMARA',
    cedula: '',
    telefono: '',
    direccion: 'Puesto 14, Pasillo Central',
    deudaVES: 10.26,
    deudaUSD: 0.04,
    fechaRegistro: new Date().toLocaleDateString('es-VE'),
    historial: [
      {
        id: 'hist-1',
        fecha: new Date().toLocaleDateString('es-VE'),
        concepto: 'Compra de 1 Kg Cebolla y 0.5 Kg Ajo',
        montoVES: 10.26,
        montoUSD: 0.04,
        tipo: 'cargo'
      }
    ]
  },
  {
    id: 'deb-2',
    nombre: 'WALTER FABRICA',
    cedula: '',
    telefono: '',
    direccion: 'Galpón 3, Zona Industrial',
    deudaVES: 4532.78,
    deudaUSD: 16.04,
    fechaRegistro: new Date().toLocaleDateString('es-VE'),
    historial: [
      {
        id: 'hist-2',
        fecha: new Date().toLocaleDateString('es-VE'),
        concepto: 'Saco de Papa 45Kg y Cesta de Tomate',
        montoVES: 4532.78,
        montoUSD: 16.04,
        tipo: 'cargo'
      }
    ]
  },
  {
    id: 'deb-3',
    nombre: 'DOÑA CARMEN PASTELERÍA',
    cedula: 'V-14238910',
    telefono: '0414-5551234',
    direccion: 'Calle Sucre, Local 5',
    deudaVES: 840.50,
    deudaUSD: 3.20,
    fechaRegistro: new Date().toLocaleDateString('es-VE'),
    historial: [
      {
        id: 'hist-3',
        fecha: new Date().toLocaleDateString('es-VE'),
        concepto: 'Fresa dulce 3Kg y Guayaba 2Kg',
        montoVES: 840.50,
        montoUSD: 3.20,
        tipo: 'cargo'
      }
    ]
  }
];
