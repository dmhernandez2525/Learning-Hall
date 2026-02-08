'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Palette, Type, Save, Loader2 } from 'lucide-react';

interface BrandingSettingsProps {
  branding: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
    borderRadius?: string;
    customCSS?: string;
    hidePoweredBy?: boolean;
    logo?: { url: string } | null;
    logoDark?: { url: string } | null;
    logoIcon?: { url: string } | null;
    favicon?: { url: string } | null;
  };
  onSave: (updates: Partial<BrandingSettingsProps['branding']>) => Promise<void>;
  className?: string;
}

const fontOptions = [
  { value: 'system', label: 'System Default' },
  { value: 'inter', label: 'Inter' },
  { value: 'roboto', label: 'Roboto' },
  { value: 'open-sans', label: 'Open Sans' },
  { value: 'lato', label: 'Lato' },
  { value: 'poppins', label: 'Poppins' },
  { value: 'montserrat', label: 'Montserrat' },
];

const radiusOptions = [
  { value: 'none', label: 'None (0px)' },
  { value: 'sm', label: 'Small (4px)' },
  { value: 'md', label: 'Medium (8px)' },
  { value: 'lg', label: 'Large (12px)' },
  { value: 'full', label: 'Full (9999px)' },
];

export function BrandingSettings({ branding, onSave, className }: BrandingSettingsProps) {
  const [formData, setFormData] = useState(branding);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
      setHasChanges(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Colors
          </CardTitle>
          <CardDescription>Customize your brand colors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={formData.primaryColor || '#14b8a6'}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={formData.primaryColor || '#14b8a6'}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  placeholder="#14b8a6"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={formData.secondaryColor || '#6366f1'}
                  onChange={(e) => handleChange('secondaryColor', e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={formData.secondaryColor || ''}
                  onChange={(e) => handleChange('secondaryColor', e.target.value)}
                  placeholder="#6366f1"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accentColor">Accent Color</Label>
              <div className="flex gap-2">
                <Input
                  id="accentColor"
                  type="color"
                  value={formData.accentColor || '#f59e0b'}
                  onChange={(e) => handleChange('accentColor', e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={formData.accentColor || ''}
                  onChange={(e) => handleChange('accentColor', e.target.value)}
                  placeholder="#f59e0b"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backgroundColor">Background Color</Label>
              <div className="flex gap-2">
                <Input
                  id="backgroundColor"
                  type="color"
                  value={formData.backgroundColor || '#ffffff'}
                  onChange={(e) => handleChange('backgroundColor', e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={formData.backgroundColor || ''}
                  onChange={(e) => handleChange('backgroundColor', e.target.value)}
                  placeholder="#ffffff"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="textColor">Text Color</Label>
              <div className="flex gap-2">
                <Input
                  id="textColor"
                  type="color"
                  value={formData.textColor || '#1f2937'}
                  onChange={(e) => handleChange('textColor', e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={formData.textColor || ''}
                  onChange={(e) => handleChange('textColor', e.target.value)}
                  placeholder="#1f2937"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Color Preview */}
          <div className="mt-6 p-4 rounded-lg border">
            <p className="text-sm text-muted-foreground mb-3">Preview</p>
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: formData.backgroundColor || '#ffffff' }}
            >
              <h3
                className="text-lg font-bold"
                style={{ color: formData.primaryColor || '#14b8a6' }}
              >
                Primary Heading
              </h3>
              <p style={{ color: formData.textColor || '#1f2937' }}>
                This is how your text will appear on the site.
              </p>
              <div className="flex gap-2 mt-3">
                <div
                  className="px-4 py-2 rounded text-white font-medium"
                  style={{ backgroundColor: formData.primaryColor || '#14b8a6' }}
                >
                  Primary Button
                </div>
                <div
                  className="px-4 py-2 rounded text-white font-medium"
                  style={{ backgroundColor: formData.secondaryColor || '#6366f1' }}
                >
                  Secondary
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="w-5 h-5" />
            Typography & Style
          </CardTitle>
          <CardDescription>Font and design settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Font Family</Label>
              <Select
                value={formData.fontFamily || 'system'}
                onValueChange={(v) => handleChange('fontFamily', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Border Radius</Label>
              <Select
                value={formData.borderRadius || 'md'}
                onValueChange={(v) => handleChange('borderRadius', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {radiusOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom CSS */}
      <Card>
        <CardHeader>
          <CardTitle>Custom CSS</CardTitle>
          <CardDescription>Advanced: Add custom styles (Pro/Enterprise only)</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.customCSS || ''}
            onChange={(e) => handleChange('customCSS', e.target.value)}
            placeholder="/* Add your custom CSS here */"
            className="font-mono text-sm min-h-[150px]"
          />
        </CardContent>
      </Card>

      {/* Powered By Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Branding Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Hide &quot;Powered by Learning Hall&quot;</Label>
              <p className="text-sm text-muted-foreground">
                Remove platform branding from your site (Enterprise only)
              </p>
            </div>
            <Switch
              checked={formData.hidePoweredBy || false}
              onCheckedChange={(checked) => handleChange('hidePoweredBy', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      {hasChanges && (
        <div className="sticky bottom-4 flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg" className="shadow-lg">
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}
