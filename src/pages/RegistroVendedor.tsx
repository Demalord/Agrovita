import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alerta } from '../components/ui/Alerta';
import { Boton, BotonLink } from '../components/ui/Boton';
import { IconoCheck } from '../components/ui/Iconos';
import { municipios } from '../services/envio';
import { textoEstadoIca, verificar } from '../services/ica';
import { useCatalogo } from '../store/catalogo';

const esquema = z.object({
  razonSocial: z.string().trim().min(3, 'Escribe la razón social.'),
  nit: z.string().trim().regex(/^[0-9.]{6,15}-?[0-9]?$/, 'Escribe un NIT válido, por ejemplo 900.123.456-7.'),
  municipio: z.string().min(1),
  correo: z.string().trim().email('Escribe un correo válido.'),
  telefono: z.string().trim().regex(/^[0-9 ]{7,15}$/, 'Escribe un teléfono válido.'),
  registroIca: z.string().trim().min(5, 'El número de registro ICA es obligatorio: sin él no puedes vender.'),
});
type Datos = z.infer<typeof esquema>;

export default function RegistroVendedor() {
  const agregarVendedor = useCatalogo((s) => s.agregarVendedor);
  const vendedores = useCatalogo((s) => s.vendedores);
  const [errorIca, setErrorIca] = useState<string | null>(null);
  const [enviado, setEnviado] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<Datos>({ resolver: zodResolver(esquema), defaultValues: { municipio: 'Ubaté' } });
  const e = formState.errors;

  async function enviar(d: Datos) {
    setErrorIca(null);
    const r = await verificar(d.registroIca);
    if (r.estado !== 'vigente') {
      setErrorIca(`El registro ${r.numero} ${r.estado === 'no-existe' ? 'no existe' : `está ${textoEstadoIca[r.estado].toLowerCase()}`} en la base del ICA. Revisa el número antes de enviar.`);
      return;
    }
    agregarVendedor({
      id: `v${vendedores.length + 1}-${Date.now().toString(36)}`,
      razonSocial: d.razonSocial,
      nit: d.nit,
      municipio: d.municipio,
      registroIca: r.numero,
      estado: 'pendiente',
      calificacion: 0,
    });
    setEnviado(d.razonSocial);
  }

  if (enviado) {
    return (
      <div className="contenedor max-w-2xl pt-12">
        <div className="tarjeta flex flex-col items-center gap-4 p-10 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-primario text-white"><IconoCheck size={32} /></span>
          <h1 className="text-2xl">Solicitud enviada</h1>
          <p className="text-texto-suave">La cuenta de <strong className="text-texto">{enviado}</strong> queda pendiente hasta que el administrador apruebe el registro ICA.</p>
          <BotonLink to="/">Volver al inicio</BotonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="contenedor max-w-3xl pt-8">
      <h1 className="text-3xl">Vende tus insumos en AgroVita</h1>
      <p className="mb-6 mt-2 text-texto-suave">Solo aceptamos almacenes y distribuidores con registro ICA vigente.</p>
      <form className="flex flex-col gap-6" noValidate onSubmit={handleSubmit(enviar)}>
        <section className="tarjeta grid gap-4 p-6 sm:grid-cols-2">
          <h2 className="text-xl sm:col-span-2">Datos de la empresa</h2>
          <div>
            <label className="etiqueta" htmlFor="rs">Razón social</label>
            <input id="rs" className="campo" {...register('razonSocial')} />
            {e.razonSocial && <p className="error-campo">{e.razonSocial.message}</p>}
          </div>
          <div>
            <label className="etiqueta" htmlFor="nit">NIT</label>
            <input id="nit" className="campo" placeholder="900.123.456-7" {...register('nit')} />
            {e.nit && <p className="error-campo">{e.nit.message}</p>}
          </div>
          <div>
            <label className="etiqueta" htmlFor="mun">Municipio</label>
            <select id="mun" className="campo" {...register('municipio')}>
              {municipios.map((m) => <option key={m.id}>{m.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="etiqueta" htmlFor="tel">Teléfono</label>
            <input id="tel" className="campo" inputMode="tel" {...register('telefono')} />
            {e.telefono && <p className="error-campo">{e.telefono.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="etiqueta" htmlFor="correo">Correo de contacto</label>
            <input id="correo" type="email" className="campo" {...register('correo')} />
            {e.correo && <p className="error-campo">{e.correo.message}</p>}
          </div>
        </section>

        <section className="tarjeta flex flex-col gap-4 p-6">
          <h2 className="text-xl">Registro ICA del almacén</h2>
          <div className="max-w-sm">
            <label className="etiqueta" htmlFor="ica">Número de registro ICA *</label>
            <input id="ica" className="campo font-mono" placeholder="ICA-DEMO-V004" {...register('registroIca')} aria-invalid={!!e.registroIca || !!errorIca} />
            {e.registroIca && <p className="error-campo">{e.registroIca.message}</p>}
          </div>
          <p className="text-sm text-texto-suave">Para probar: <code>ICA-DEMO-V004</code> es un registro vigente; <code>ICA-FALSO-777</code> no existe.</p>
          {errorIca && <Alerta tipo="error" titulo="No pudimos validar el registro">{errorIca}</Alerta>}
        </section>

        <Alerta tipo="aviso" titulo="Tu cuenta queda pendiente">
          Verificamos tu registro ICA antes de activar la cuenta. Te avisaremos por correo cuando puedas publicar productos.
        </Alerta>
        <div className="flex flex-wrap gap-3">
          <Boton type="submit" cargando={formState.isSubmitting}>Enviar solicitud</Boton>
          <BotonLink to="/" variante="secundario">Cancelar</BotonLink>
        </div>
      </form>
    </div>
  );
}
