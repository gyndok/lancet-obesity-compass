import { useState, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface MedicationFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
}

export interface FilterState {
  search: string;
  drugClass: string[];
  route: string[];
  pregnancyContraindicated: boolean | null;
  comorbidityTags: string[];
}

const drugClasses = [
  'GLP-1 Receptor Agonist',
  'GLP-1/GIP Receptor Agonist',
  'Sympathomimetic Amine/Anticonvulsant',
  'Lipase Inhibitor',
  'Opioid Antagonist/Antidepressant',
];

const routes = [
  { value: 'oral', label: 'Oral' },
  { value: 'weekly_injection', label: 'Weekly Injection' },
  { value: 'daily_injection', label: 'Daily Injection' },
  { value: 'other', label: 'Other' },
];

const comorbidityOptions = [
  'T2D benefit',
  'Cardiovascular benefit',
  'Prediabetes benefit',
  'HTN caution',
  'GERD/gastroparesis caution',
  'Mood caution',
  'Migraine benefit',
];

export function MedicationFilters({ onFiltersChange }: MedicationFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    drugClass: [],
    route: [],
    pregnancyContraindicated: null,
    comorbidityTags: [],
  });

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const toggleDrugClass = (drugClass: string) => {
    setFilters(prev => ({
      ...prev,
      drugClass: prev.drugClass.includes(drugClass)
        ? prev.drugClass.filter(c => c !== drugClass)
        : [...prev.drugClass, drugClass],
    }));
  };

  const toggleRoute = (route: string) => {
    setFilters(prev => ({
      ...prev,
      route: prev.route.includes(route)
        ? prev.route.filter(r => r !== route)
        : [...prev.route, route],
    }));
  };

  const toggleComorbidity = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      comorbidityTags: prev.comorbidityTags.includes(tag)
        ? prev.comorbidityTags.filter(t => t !== tag)
        : [...prev.comorbidityTags, tag],
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      drugClass: [],
      route: [],
      pregnancyContraindicated: null,
      comorbidityTags: [],
    });
  };

  const activeFilterCount = 
    filters.drugClass.length + 
    filters.route.length + 
    filters.comorbidityTags.length +
    (filters.pregnancyContraindicated !== null ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by generic or brand name..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
        {filters.search && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => handleSearchChange('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Drug Class Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <Filter className="h-4 w-4 mr-2" />
              Class
              {filters.drugClass.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filters.drugClass.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="start">
            <div className="space-y-2">
              <p className="text-sm font-medium">Drug Class</p>
              {drugClasses.map((drugClass) => (
                <div key={drugClass} className="flex items-center space-x-2">
                  <Checkbox
                    id={`class-${drugClass}`}
                    checked={filters.drugClass.includes(drugClass)}
                    onCheckedChange={() => toggleDrugClass(drugClass)}
                  />
                  <Label htmlFor={`class-${drugClass}`} className="text-sm">
                    {drugClass}
                  </Label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Route Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              Route
              {filters.route.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filters.route.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48" align="start">
            <div className="space-y-2">
              <p className="text-sm font-medium">Route/Frequency</p>
              {routes.map((route) => (
                <div key={route.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`route-${route.value}`}
                    checked={filters.route.includes(route.value)}
                    onCheckedChange={() => toggleRoute(route.value)}
                  />
                  <Label htmlFor={`route-${route.value}`} className="text-sm">
                    {route.label}
                  </Label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Pregnancy Filter */}
        <Select
          value={filters.pregnancyContraindicated === null ? 'all' : filters.pregnancyContraindicated ? 'yes' : 'no'}
          onValueChange={(value) => 
            setFilters(prev => ({
              ...prev,
              pregnancyContraindicated: value === 'all' ? null : value === 'yes',
            }))
          }
        >
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="Pregnancy Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Pregnancy Status</SelectItem>
            <SelectItem value="yes">Pregnancy Contraindicated</SelectItem>
            <SelectItem value="no">Not Contraindicated</SelectItem>
          </SelectContent>
        </Select>

        {/* Comorbidity Tags Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              Comorbidities
              {filters.comorbidityTags.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filters.comorbidityTags.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="start">
            <div className="space-y-2">
              <p className="text-sm font-medium">Comorbidity Tags</p>
              {comorbidityOptions.map((tag) => (
                <div key={tag} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tag-${tag}`}
                    checked={filters.comorbidityTags.includes(tag)}
                    onCheckedChange={() => toggleComorbidity(tag)}
                  />
                  <Label htmlFor={`tag-${tag}`} className="text-sm">
                    {tag}
                  </Label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.drugClass.map((c) => (
            <Badge key={c} variant="secondary" className="gap-1">
              {c}
              <X className="h-3 w-3 cursor-pointer" onClick={() => toggleDrugClass(c)} />
            </Badge>
          ))}
          {filters.route.map((r) => (
            <Badge key={r} variant="secondary" className="gap-1">
              {routes.find(rt => rt.value === r)?.label || r}
              <X className="h-3 w-3 cursor-pointer" onClick={() => toggleRoute(r)} />
            </Badge>
          ))}
          {filters.comorbidityTags.map((t) => (
            <Badge key={t} variant="secondary" className="gap-1">
              {t}
              <X className="h-3 w-3 cursor-pointer" onClick={() => toggleComorbidity(t)} />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
