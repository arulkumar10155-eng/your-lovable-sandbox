import React from 'react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { ArrowLeft, Send, AlertCircle, FileText } from 'lucide-react';
import { Label } from './ui/label';
import { categories } from './CategorySelector';

interface CategorySuggestion {
  categoryId: string;
  text: string;
}

interface SuggestionFormProps {
  suggestion: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  selectedCategories?: string[];
  categorySuggestions?: CategorySuggestion[];
  onCategorySuggestionChange?: (categoryId: string, text: string) => void;
}

const SuggestionForm: React.FC<SuggestionFormProps> = ({
  suggestion,
  onChange,
  onSubmit,
  onBack,
  isSubmitting,
  selectedCategories = [],
  categorySuggestions = [],
  onCategorySuggestionChange,
}) => {
  const minLength = 50;
  const maxLength = 2000;
  
  // Calculate total text length from all category-specific boxes
  const totalCategoryLength = categorySuggestions.reduce((acc, cs) => acc + cs.text.length, 0);
  const currentLength = suggestion.length + totalCategoryLength;
  
  // Valid if at least one category has enough text or the main suggestion does
  const hasEnoughContent = selectedCategories.length > 1 
    ? categorySuggestions.some(cs => cs.text.length >= 30) || suggestion.length >= minLength
    : suggestion.length >= minLength;
  
  const isValid = hasEnoughContent && currentLength <= maxLength * selectedCategories.length;

  const getCategoryInfo = (catId: string) => {
    return categories.find(c => c.id === catId);
  };

  const showCategoryBoxes = selectedCategories.length > 1 && onCategorySuggestionChange;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          உங்கள் யோசனையை பகிர்ந்து கொள்ளுங்கள்
        </h2>
        <p className="text-lg text-muted-foreground">Share your suggestion</p>
      </div>

      <div className="space-y-6">
        {/* Category-specific text boxes when multiple categories are selected */}
        {showCategoryBoxes && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              💡 நீங்கள் பல பிரிவுகளைத் தேர்ந்தெடுத்துள்ளீர்கள். ஒவ்வொரு பிரிவுக்கும் தனித்தனியாக யோசனைகளை எழுதலாம்.
              <br />
              <span className="text-xs">You selected multiple categories. Write suggestions for each category separately.</span>
            </p>
            
            {selectedCategories.map((catId) => {
              const catInfo = getCategoryInfo(catId);
              const catSuggestion = categorySuggestions.find(cs => cs.categoryId === catId);
              const catText = catSuggestion?.text || '';
              
              return (
                <div key={catId} className="space-y-2 p-4 border border-border rounded-lg bg-card">
                  <Label className="flex items-center gap-2 text-base font-medium">
                    {catInfo && <catInfo.icon className="w-4 h-4 text-tvk-maroon" />}
                    {catInfo?.tamilName || catId} / {catInfo?.name || catId}
                  </Label>
                  <Textarea
                    placeholder={`${catInfo?.tamilName || catId} பற்றிய உங்கள் யோசனை...`}
                    value={catText}
                    onChange={(e) => onCategorySuggestionChange?.(catId, e.target.value)}
                    className="min-h-[100px] text-sm resize-none"
                    maxLength={maxLength}
                  />
                  <div className="flex justify-end text-xs text-muted-foreground">
                    <span>{catText.length} / {maxLength}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Main suggestion box */}
        <div className="space-y-4">
          <Label htmlFor="suggestion" className="flex items-center gap-2 text-base">
            <FileText className="w-4 h-4 text-primary" />
            {showCategoryBoxes ? 'கூடுதல் குறிப்புகள் / Additional Notes (Optional)' : 'விரிவான பரிந்துரை / Detailed Suggestion'}
          </Label>
          
          <Textarea
            id="suggestion"
            placeholder={showCategoryBoxes 
              ? "மேலே குறிப்பிடாத கூடுதல் தகவல்கள்..."
              : "உங்கள் யோசனை அல்லது பரிந்துரையை இங்கே எழுதுங்கள்...\nWrite your idea or suggestion here...\n\nஉதாரணம் / Example:\nஎனது கிராமத்தில் பள்ளிக்கு போதுமான ஆசிரியர்கள் இல்லை. கணிதம் மற்றும் அறிவியல் ஆசிரியர்கள் அதிகமாக தேவை..."}
            value={suggestion}
            onChange={(e) => onChange(e.target.value)}
            className={`${showCategoryBoxes ? 'min-h-[100px]' : 'min-h-[200px]'} text-base resize-none`}
            maxLength={maxLength}
          />

          <div className="flex items-center justify-between text-sm">
            <div className={`flex items-center gap-2 ${!hasEnoughContent ? 'text-destructive' : 'text-muted-foreground'}`}>
              {!hasEnoughContent && <AlertCircle className="w-4 h-4" />}
              <span>
                {showCategoryBoxes 
                  ? 'ஒரு பிரிவில் குறைந்தது 30 எழுத்துக்கள் / At least 30 chars in one category'
                  : `குறைந்தபட்சம் ${minLength} எழுத்துக்கள் / Minimum ${minLength} characters`}
              </span>
            </div>
            <span className={suggestion.length > maxLength ? 'text-destructive' : 'text-muted-foreground'}>
              {suggestion.length} / {maxLength}
            </span>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-sm text-muted-foreground flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 text-tvk-maroon" />
              <span>
                <strong>குறிப்பு:</strong> தயவுசெய்து மரியாதையான மொழியைப் பயன்படுத்தவும். 
                தகவல்கள் பாதுகாப்பாக வைக்கப்படும்.
                <br />
                <em>Note: Please use respectful language. Your information will be kept secure.</em>
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-6">
        <Button variant="outline" size="xl" onClick={onBack} className="flex-1" disabled={isSubmitting}>
          <ArrowLeft className="mr-2" />
          பின்னால் / Back
        </Button>
        <Button
          variant="hero"
          size="xl"
          onClick={onSubmit}
          disabled={!isValid || isSubmitting}
          className="flex-1 group"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-tvk-maroon-dark border-t-transparent rounded-full animate-spin" />
              சமர்ப்பிக்கிறது...
            </>
          ) : (
            <>
              சமர்ப்பிக்கவும் / Submit
              <Send className="ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SuggestionForm;