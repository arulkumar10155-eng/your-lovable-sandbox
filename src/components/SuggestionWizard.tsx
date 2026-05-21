import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import StepIndicator from './StepIndicator';
import FormStep from './FormStep';
import BasicInfoForm from './BasicInfoForm';
import CategorySelector from './CategorySelector';
import SubCategorySelector from './SubCategorySelector';
import SuggestionForm from './SuggestionForm';
import ThankYouPage from './ThankYouPage';
import VolunteerPopup from './VolunteerPopup';
import TVKLogo from './TVKLogo';
import LanguageSelector, { Language, useTranslation } from './LanguageSelector';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SuggestionWizardProps {
  onClose: () => void;
}

interface CategorySuggestion {
  categoryId: string;
  text: string;
}

const steps = [
  { title: 'Basic Info', tamilTitle: 'அடிப்படை' },
  { title: 'Category', tamilTitle: 'பிரிவு' },
  { title: 'Sub-Category', tamilTitle: 'துணைப்பிரிவு' },
  { title: 'Suggestion', tamilTitle: 'யோசனை' },
];

const SuggestionWizard: React.FC<SuggestionWizardProps> = ({ onClose }) => {
  const [language, setLanguage] = useState<Language | null>(null);
  const t = language ? useTranslation(language) : null;

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showVolunteerPopup, setShowVolunteerPopup] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [areas, setAreas] = useState<{ area_name: string; polling_booths: string[] }[]>([]);

  const [formData, setFormData] = useState({
    basicInfo: {
      name: '',
      age: '',
      city: '',
      constituency: '',
      area: '',
      pollingBooth: '',
      pincode: '',
      occupation: '',
    },
    categories: [] as string[],
    subCategories: [] as string[],
    suggestion: '',
    otherCategory: '',
    otherSubCategories: {} as Record<string, string>,
    categorySuggestions: [] as CategorySuggestion[],
  });

  useEffect(() => {
    if (formData.basicInfo.city && formData.basicInfo.constituency) {
      fetchAreas();
    }
  }, [formData.basicInfo.city, formData.basicInfo.constituency]);

  const fetchAreas = async () => {
    const { data } = await supabase
      .from('areas')
      .select('area_name, polling_booths')
      .eq('city', formData.basicInfo.city)
      .eq('constituency', formData.basicInfo.constituency);
    if (data) setAreas(data);
  };

  const updateBasicInfo = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      basicInfo: { ...prev.basicInfo, [field]: value },
    }));
    if (field === 'city') {
      setFormData((prev) => ({
        ...prev,
        basicInfo: { ...prev.basicInfo, [field]: value, constituency: '', area: '', pollingBooth: '' },
      }));
      setAreas([]);
    }
    if (field === 'constituency') {
      setFormData((prev) => ({
        ...prev,
        basicInfo: { ...prev.basicInfo, [field]: value, area: '', pollingBooth: '' },
      }));
    }
  };

  const handleCategoryChange = (categories: string[]) => {
    setFormData((prev) => {
      // Initialize category suggestions for new categories
      const existingSuggestions = prev.categorySuggestions;
      const newSuggestions = categories.map(catId => {
        const existing = existingSuggestions.find(cs => cs.categoryId === catId);
        return existing || { categoryId: catId, text: '' };
      });
      
      return { ...prev, categories, categorySuggestions: newSuggestions };
    });
  };

  const handleCategorySuggestionChange = (categoryId: string, text: string) => {
    setFormData((prev) => ({
      ...prev,
      categorySuggestions: prev.categorySuggestions.map(cs => 
        cs.categoryId === categoryId ? { ...cs, text } : cs
      ),
    }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Combine all suggestions
      const allSuggestions = formData.categories.length > 1
        ? formData.categorySuggestions
            .filter(cs => cs.text.trim().length > 0)
            .map(cs => `[${cs.categoryId}]: ${cs.text}`)
            .join('\n\n') + (formData.suggestion ? `\n\nAdditional: ${formData.suggestion}` : '')
        : formData.suggestion;

      // Analyze sentiment
      let sentiment = 'neutral';
      let sentimentScore = 0.5;

      try {
        const { data: sentimentData } = await supabase.functions.invoke('analyze-sentiment', {
          body: { text: allSuggestions, type: 'suggestion' },
        });
        if (sentimentData) {
          sentiment = sentimentData.sentiment || 'neutral';
          sentimentScore = sentimentData.score || 0.5;
        }
      } catch {
        // ignore
      }

      // Include "other" values in categories/subcategories
      const finalCategories = [...formData.categories];
      if (formData.otherCategory) {
        finalCategories.push(`other:${formData.otherCategory}`);
      }

      const finalSubCategories = [...formData.subCategories];
      Object.entries(formData.otherSubCategories).forEach(([catId, value]) => {
        if (value) {
          finalSubCategories.push(`${catId}-other:${value}`);
        }
      });

      const newId = crypto.randomUUID();

      const insertData = {
        id: newId,
        name: formData.basicInfo.name.trim(),
        age: Number(formData.basicInfo.age),
        city: formData.basicInfo.city,
        constituency: formData.basicInfo.constituency || null,
        area: formData.basicInfo.area || null,
        polling_booth: formData.basicInfo.pollingBooth || null,
        pincode: formData.basicInfo.pincode,
        occupation: formData.basicInfo.occupation,
        categories: finalCategories.length > 0 ? finalCategories : ['other'],
        sub_categories: finalSubCategories.length > 0 ? finalSubCategories : ['general-other'],
        suggestion: allSuggestions.trim(),
        sentiment,
        sentiment_score: sentimentScore,
      };

      console.log('Submitting suggestion:', insertData);

      const { error } = await supabase.from('suggestions').insert(insertData);

      if (error) {
        console.error('Supabase insert error:', error);
        toast.error(`${t ? t.error : 'Error'}: ${error.message || error.code || 'Unknown error'}`);
        return;
      }

      toast.success(t ? t.success : 'Successfully submitted!');
      setSubmissionId(newId);
      setShowVolunteerPopup(true);
    } catch (err) {
      console.error('Error:', err);
      toast.error(t ? t.error : 'Error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      basicInfo: { name: '', age: '', city: '', constituency: '', area: '', pollingBooth: '', pincode: '', occupation: '' },
      categories: [],
      subCategories: [],
      suggestion: '',
      otherCategory: '',
      otherSubCategories: {},
      categorySuggestions: [],
    });
    setCurrentStep(1);
    setIsComplete(false);
    setShowVolunteerPopup(false);
    onClose();
  };

  if (showVolunteerPopup) {
    return (
      <VolunteerPopup
        submissionId={submissionId!}
        submissionType="suggestion"
        userData={{
          name: formData.basicInfo.name,
          city: formData.basicInfo.city,
          constituency: formData.basicInfo.constituency,
          area: formData.basicInfo.area,
          pollingBooth: formData.basicInfo.pollingBooth,
        }}
        onClose={handleReset}
      />
    );
  }

  if (isComplete) {
    return <ThankYouPage formData={formData} onReset={handleReset} />;
  }

  if (!language) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg">
          <div className="flex items-center justify-center gap-2 mb-6">
            <TVKLogo size="sm" />
            <span className="font-bold text-foreground">TVK</span>
          </div>
          <h1 className="text-xl font-bold text-foreground text-center mb-2">மொழியைத் தேர்ந்தெடுக்கவும் / Select Language</h1>
          <p className="text-sm text-muted-foreground text-center mb-6">தொடர மொழியைத் தேர்ந்தெடுக்கவும் / Select language to continue</p>

          <div className="flex justify-center mb-6">
            <LanguageSelector language={language ?? 'ta'} onChange={(l) => setLanguage(l)} />
          </div>

          <Button variant="hero" className="w-full" onClick={() => setLanguage(language ?? 'ta')}>Continue</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-4 md:py-8 px-3 md:px-4 overflow-x-hidden">
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <Button variant="ghost" onClick={onClose} className="text-muted-foreground text-xs md:text-sm px-2 md:px-4">
            <ArrowLeft className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">முகப்பு / </span>Home
          </Button>
          <div className="flex items-center gap-2">
            <TVKLogo size="sm" />
            <span className="font-bold text-primary hidden sm:inline">TVK</span>
          </div>
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} totalSteps={4} steps={steps} />

        {/* Form Container */}
        <div className="bg-card rounded-xl md:rounded-2xl shadow-lg border border-border p-4 md:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <FormStep isActive={currentStep === 1}>
              <BasicInfoForm
                data={formData.basicInfo}
                onChange={updateBasicInfo}
                onNext={handleNext}
                areas={areas}
              />
            </FormStep>

            <FormStep isActive={currentStep === 2}>
              <CategorySelector
                selectedCategories={formData.categories}
                onChange={handleCategoryChange}
                onNext={handleNext}
                onBack={handleBack}
                otherCategory={formData.otherCategory}
                onOtherCategoryChange={(value) => setFormData(prev => ({ ...prev, otherCategory: value }))}
              />
            </FormStep>

            <FormStep isActive={currentStep === 3}>
              <SubCategorySelector
                selectedCategories={formData.categories}
                selectedSubCategories={formData.subCategories}
                onChange={(subCategories) => setFormData((prev) => ({ ...prev, subCategories }))}
                onNext={handleNext}
                onBack={handleBack}
                otherSubCategories={formData.otherSubCategories}
                onOtherSubCategoryChange={(catId, value) => 
                  setFormData(prev => ({ 
                    ...prev, 
                    otherSubCategories: { ...prev.otherSubCategories, [catId]: value } 
                  }))
                }
              />
            </FormStep>

            <FormStep isActive={currentStep === 4}>
              <SuggestionForm
                suggestion={formData.suggestion}
                onChange={(suggestion) => setFormData((prev) => ({ ...prev, suggestion }))}
                onSubmit={handleSubmit}
                onBack={handleBack}
                isSubmitting={isSubmitting}
                selectedCategories={formData.categories}
                categorySuggestions={formData.categorySuggestions}
                onCategorySuggestionChange={handleCategorySuggestionChange}
              />
            </FormStep>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 md:mt-8 px-2">
          <p className="text-xs md:text-sm text-muted-foreground">
            உங்கள் தகவல்கள் பாதுகாப்பாக வைக்கப்படும் 🔒
          </p>
          <p className="text-xs text-muted-foreground">
            Your information will be kept secure
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuggestionWizard;