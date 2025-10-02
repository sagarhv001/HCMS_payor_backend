import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Search, BookOpen, Stethoscope, Activity } from 'lucide-react';

const MedicalCodesCheatsheet = ({ trigger }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('icd10');

  // Common ICD-10 Diagnosis Codes
  const icd10Codes = [
    { code: 'J20.9', description: 'Acute bronchitis, unspecified', category: 'Respiratory' },
    { code: 'Z00.00', description: 'Encounter for general adult medical examination without abnormal findings', category: 'Preventive' },
    { code: 'I25.10', description: 'Atherosclerotic heart disease of native coronary artery without angina pectoris', category: 'Cardiac' },
    { code: 'Z51.11', description: 'Encounter for antineoplastic chemotherapy', category: 'Treatment' },
    { code: 'M79.3', description: 'Panniculitis, unspecified', category: 'Musculoskeletal' },
    { code: 'K59.00', description: 'Constipation, unspecified', category: 'Digestive' },
    { code: 'R50.9', description: 'Fever, unspecified', category: 'Symptoms' },
    { code: 'J06.9', description: 'Acute upper respiratory infection, unspecified', category: 'Respiratory' },
    { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications', category: 'Endocrine' },
    { code: 'I10', description: 'Essential (primary) hypertension', category: 'Cardiovascular' },
    { code: 'J45.9', description: 'Asthma, unspecified', category: 'Respiratory' },
    { code: 'M25.50', description: 'Pain in unspecified joint', category: 'Musculoskeletal' },
    { code: 'R51', description: 'Headache', category: 'Neurological' },
    { code: 'K21.9', description: 'Gastro-esophageal reflux disease without esophagitis', category: 'Digestive' },
    { code: 'L30.9', description: 'Dermatitis, unspecified', category: 'Skin' },
    { code: 'F32.9', description: 'Major depressive disorder, single episode, unspecified', category: 'Mental Health' },
    { code: 'N39.0', description: 'Urinary tract infection, site not specified', category: 'Genitourinary' },
    { code: 'H10.9', description: 'Unspecified conjunctivitis', category: 'Eye' },
    { code: 'G43.909', description: 'Migraine, unspecified, not intractable, without status migrainosus', category: 'Neurological' },
    { code: 'M54.5', description: 'Low back pain', category: 'Musculoskeletal' }
  ];

  // Common CPT Procedure Codes
  const cptCodes = [
    { code: '99213', description: 'Office/outpatient visit, established patient, low complexity', category: 'Office Visits' },
    { code: '99214', description: 'Office/outpatient visit, established patient, moderate complexity', category: 'Office Visits' },
    { code: '99215', description: 'Office/outpatient visit, established patient, high complexity', category: 'Office Visits' },
    { code: '99202', description: 'Office/outpatient visit, new patient, straightforward', category: 'Office Visits' },
    { code: '99203', description: 'Office/outpatient visit, new patient, low complexity', category: 'Office Visits' },
    { code: '85025', description: 'Blood count; complete (CBC), automated', category: 'Laboratory' },
    { code: '80053', description: 'Comprehensive metabolic panel', category: 'Laboratory' },
    { code: '80061', description: 'Lipid panel', category: 'Laboratory' },
    { code: '93000', description: 'Electrocardiogram, routine ECG with at least 12 leads', category: 'Cardiology' },
    { code: '93005', description: 'Electrocardiogram, tracing only, without interpretation', category: 'Cardiology' },
    { code: '36415', description: 'Collection of venous blood by venipuncture', category: 'Laboratory' },
    { code: '99396', description: 'Periodic comprehensive preventive medicine, established patient, 40-64 years', category: 'Preventive' },
    { code: '99397', description: 'Periodic comprehensive preventive medicine, established patient, 65+ years', category: 'Preventive' },
    { code: '76700', description: 'Abdominal ultrasound, complete', category: 'Radiology' },
    { code: '70450', description: 'CT head/brain without contrast', category: 'Radiology' },
    { code: '72148', description: 'MRI lumbar spine without contrast', category: 'Radiology' },
    { code: '45378', description: 'Colonoscopy, flexible; diagnostic', category: 'Procedures' },
    { code: '12001', description: 'Simple repair of superficial wounds of scalp, neck, axillae, external genitalia, trunk and/or extremities (including hands and feet); 2.5 cm or less', category: 'Surgery' },
    { code: '90471', description: 'Immunization administration', category: 'Immunization' },
    { code: '90715', description: 'Tetanus, diphtheria toxoids and acellular pertussis vaccine (Tdap)', category: 'Immunization' }
  ];

  const filterCodes = (codes, searchTerm) => {
    if (!searchTerm) return codes;
    return codes.filter(item => 
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Respiratory': 'bg-blue-100 text-blue-800',
      'Preventive': 'bg-green-100 text-green-800',
      'Cardiac': 'bg-red-100 text-red-800',
      'Cardiovascular': 'bg-red-100 text-red-800',
      'Treatment': 'bg-purple-100 text-purple-800',
      'Musculoskeletal': 'bg-orange-100 text-orange-800',
      'Digestive': 'bg-yellow-100 text-yellow-800',
      'Symptoms': 'bg-gray-100 text-gray-800',
      'Endocrine': 'bg-pink-100 text-pink-800',
      'Neurological': 'bg-indigo-100 text-indigo-800',
      'Skin': 'bg-amber-100 text-amber-800',
      'Mental Health': 'bg-violet-100 text-violet-800',
      'Genitourinary': 'bg-cyan-100 text-cyan-800',
      'Eye': 'bg-emerald-100 text-emerald-800',
      'Office Visits': 'bg-blue-100 text-blue-800',
      'Laboratory': 'bg-green-100 text-green-800',
      'Cardiology': 'bg-red-100 text-red-800',
      'Radiology': 'bg-purple-100 text-purple-800',
      'Procedures': 'bg-orange-100 text-orange-800',
      'Surgery': 'bg-red-100 text-red-800',
      'Immunization': 'bg-teal-100 text-teal-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const filteredICD10 = filterCodes(icd10Codes, searchTerm);
  const filteredCPT = filterCodes(cptCodes, searchTerm);

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Trigger Button */}
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>
          {trigger}
        </div>
      ) : (
        <Button variant="outline" className="gap-2" onClick={() => setIsOpen(true)}>
          <BookOpen className="w-4 h-4" />
          Medical Codes Reference
        </Button>
      )}

      {/* Custom Modal Overlay and Content */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal Content */}
          <div 
            style={{
              position: 'fixed',
              top: '10vh',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 9999,
              width: '90vw',
              maxWidth: '1024px',
              height: '80vh',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'grid',
              gridTemplateRows: 'auto auto 1fr',
              gap: 0
            }}
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="m6 6 12 12"></path>
                <path d="m18 6-12 12"></path>
              </svg>
              <span className="sr-only">Close</span>
            </button>

            {/* Header */}
            <div className="p-6 pb-4">
              <h2 className="text-lg font-semibold leading-none tracking-tight flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-blue-600" />
                Medical Codes Cheatsheet
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Quick reference for ICD-10 diagnosis codes and CPT procedure codes
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="px-6 pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by code, description, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Content */}
            <div className="overflow-hidden px-6 pb-6">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col gap-2">
            <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
              <TabsTrigger value="icd10" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                ICD-10 Diagnosis Codes
              </TabsTrigger>
              <TabsTrigger value="cpt" className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4" />
                CPT Procedure Codes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="icd10" className="flex-1 overflow-auto mt-0 outline-none">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">ICD-10 Diagnosis Codes</h3>
                  <p className="text-sm text-muted-foreground">
                    International Classification of Diseases, 10th Revision - Clinical Modification
                  </p>
                </div>
                <div className="space-y-2">
                    {filteredICD10.map((item, index) => (
                      <div key={index} className="p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono font-semibold text-blue-600">{item.code}</span>
                              <Badge className={getCategoryColor(item.category)}>
                                {item.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700">{item.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredICD10.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No ICD-10 codes found matching your search.
                      </div>
                    )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cpt" className="flex-1 overflow-auto mt-0 outline-none">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">CPT Procedure Codes</h3>
                  <p className="text-sm text-muted-foreground">
                    Current Procedural Terminology codes for medical procedures and services
                  </p>
                </div>
                <div className="space-y-2">
                    {filteredCPT.map((item, index) => (
                      <div key={index} className="p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono font-semibold text-green-600">{item.code}</span>
                              <Badge className={getCategoryColor(item.category)}>
                                {item.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700">{item.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredCPT.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No CPT codes found matching your search.
                      </div>
                    )}
                </div>
              </div>
            </TabsContent>
              </Tabs>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MedicalCodesCheatsheet;