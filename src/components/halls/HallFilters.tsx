
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TASHKENT_DISTRICTS } from '@/store/hallsStore';

const formSchema = z.object({
  searchText: z.string().optional(),
  district: z.string().optional(),
  approved: z.string().optional(),
  sortBy: z.string().optional(),
});

type FilterProps = {
  showApprovalFilter?: boolean;
  onFilter: (filters: {
    searchText?: string;
    district?: string;
    approved?: boolean;
    sortBy?: string;
  }) => void;
  onReset: () => void;
};

export function HallFilters({ 
  showApprovalFilter = false, 
  onFilter, 
  onReset 
}: FilterProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      searchText: '',
      district: '',
      approved: '',
      sortBy: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const filters: {
      searchText?: string;
      district?: string;
      approved?: boolean;
      sortBy?: string;
    } = {};

    if (values.searchText) filters.searchText = values.searchText;
    if (values.district) filters.district = values.district;
    if (values.approved) {
      filters.approved = values.approved === 'approved';
    }
    if (values.sortBy) filters.sortBy = values.sortBy;

    onFilter(filters);
  }

  function handleReset() {
    form.reset();
    onReset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <FormField
            control={form.control}
            name="searchText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Search</FormLabel>
                <FormControl>
                  <Input placeholder="Search by name or address..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="district"
            render={({ field }) => (
              <FormItem>
                <FormLabel>District</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Any District" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Any District</SelectItem>
                    {TASHKENT_DISTRICTS.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {showApprovalFilter && (
            <FormField
              control={form.control}
              name="approved"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Any Status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Any Status</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="not_approved">Not Approved</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="sortBy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sort By</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    <SelectItem value="capacity_asc">Capacity: Low to High</SelectItem>
                    <SelectItem value="capacity_desc">Capacity: High to Low</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-end gap-2">
            <Button type="submit" className="flex-1">Apply Filters</Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
