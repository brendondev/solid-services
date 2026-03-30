'use client';

import { useEffect, useState } from 'react';
import { Building2, Save, Upload, MapPin, Phone, Mail, Globe, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { companyApi } from '@/lib/api/company';

export default function CompanySettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Company data
  const [companyName, setCompanyName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [document, setDocument] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');

  // Address
  const [zipCode, setZipCode] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  // Logo
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    try {
      setLoading(true);
      const data = await companyApi.getCompanyData();

      // Dados da empresa
      setCompanyName(data.companyName || '');
      setTradeName(data.tradingName || '');
      setDocument(data.document || '');
      setEmail(data.email || '');
      setPhone(data.phone || '');
      setWebsite(data.website || '');
      setLogo(data.logo || null);

      // Endereço
      setZipCode(data.zipCode || '');
      setStreet(data.street || '');
      setNumber(data.number || '');
      setComplement(data.complement || '');
      setNeighborhood(data.district || '');
      setCity(data.city || '');
      setState(data.state || '');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao carregar dados da empresa';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      await companyApi.updateCompanyData({
        logo: logo || undefined,
        companyName: companyName || undefined,
        tradingName: tradeName || undefined,
        document: document || undefined,
        email: email || undefined,
        phone: phone || undefined,
        website: website || undefined,
        // Endereço
        zipCode: zipCode || undefined,
        street: street || undefined,
        number: number || undefined,
        complement: complement || undefined,
        district: neighborhood || undefined,
        city: city || undefined,
        state: state || undefined,
      });

      toast.success('Dados da empresa atualizados com sucesso!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao salvar dados';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
        toast.success('Logo carregada! Salve para confirmar.');
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Building2 className="w-8 h-8" />
          Configurações da Empresa
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie os dados da sua empresa
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Logo */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold mb-4">Logo da Empresa</h3>

          <div className="flex items-center gap-6">
            <div className="w-32 h-32 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted overflow-hidden">
              {logo ? (
                <img src={logo} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <Building2 className="w-12 h-12 text-muted-foreground" />
              )}
            </div>

            <div className="flex-1">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                <Upload className="w-4 h-4" />
                Carregar Logo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-muted-foreground mt-2">
                Recomendado: 400x400px, PNG ou JPG
              </p>
            </div>
          </div>
        </div>

        {/* Dados Principais */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold mb-4">Dados da Empresa</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Razão Social *
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Nome Fantasia
              </label>
              <input
                type="text"
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                CNPJ *
              </label>
              <input
                type="text"
                value={document}
                onChange={(e) => setDocument(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Telefone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Globe className="w-4 h-4 inline mr-1" />
                Website
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="https://"
              />
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Endereço
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">CEP</label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Logradouro</label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Número</label>
              <input
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Complemento</label>
              <input
                type="text"
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bairro</label>
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Cidade</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Estado</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Selecione</option>
                <option value="SP">São Paulo</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="MG">Minas Gerais</option>
                {/* Adicionar outros estados */}
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={loadCompanyData}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}
