import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-dropdowns',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
})
export class DropdownsComponent implements OnInit {
  dropdownConfig: any = [
    {
      key: 'Location',
      data: [
        { id: '1', value: 'London' },
        { id: '2', value: 'India' },
        { id: '3', value: 'New York' },
      ],
    },
    {
      key: 'Vehicle',
      data: [
        { id: '1', value: 'Alto' },
        { id: '2', value: 'Hyundai' },
        { id: '3', value: 'Honda' },
      ],
    },
    {
      key: 'Organization',
      data: [
        { id: '1', value: 'VI' },
        { id: '20', value: 'Vodafone' },
        { id: '21', value: 'Idea' },
      ],
    },
    {
      key: 'Department',
      data: [
        { id: '1', value: 'IT', parentId: '1' },
        { id: '2', value: 'Sales', parentId: '1' },
        { id: '3', value: 'Maintenance', parentId: '20' },
        { id: '4', value: 'Service', parentId: '20' },
        { id: '5', value: 'Care', parentId: '20' },
        { id: '6', value: 'Finance', parentId: '20' },
        { id: '7', value: 'Network', parentId: '21' },
      ],
      dependOn: 'Organization',
    },
  ];

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      dropdownSets: this.fb.array([this.createDropdownSet()]),
    });
  }

  ngOnInit(): void {}

  createDropdownSet() {
    return this.fb.group({
      key: [null],
      value: [null],
      dependentKey: [null],
    });
  }

  get dropdownSets(): FormArray {
    return this.form.get('dropdownSets') as FormArray;
  }

  addDropdownSet(): void {
    const dropdownSet = this.createDropdownSet();
    this.dropdownSets.push(dropdownSet);
  }

  removeDropdownSet(index: number): void {
    this.dropdownSets.removeAt(index);
  }

  onSubmit(): void {
    if (this.form.valid) {
      console.log('Submitted Values:', this.form.value.dropdownSets);
    }
  }

  getFilteredOptions(index: number): any[] {
    const selectedKey = this.dropdownSets.at(index).get('key')?.value;
    const config = this.dropdownConfig.find((c: any) => c.key === selectedKey);

    if (config) {
      let filteredOptions = [...config.data];
      if (config.dependOn) {
        const selectedParentValue = this.dropdownSets.value
          .filter((x: any) => x.key === config.dependOn)
          .map((x: any) => x.value)[0];

        if (!selectedParentValue) {
          return [{ id: null, value: `Select ${config.dependOn}` }];
        }

        filteredOptions = config.data.filter(
          (option: any) => option.parentId === selectedParentValue
        );
      }
      return filteredOptions;
    }
    return [];
  }

  onDependentChange(index: number): void {
    const selectedKey = this.dropdownSets.at(index).get('key')?.value;
    const selectedValue = this.dropdownSets.at(index).get('value')?.value;
    const config = this.dropdownConfig.find(
      (c: any) => c.dependOn === selectedKey
    );

    if (config && config.dependOn) {
      const dependentKey = config.dependOn;
      const parentValue = this.dropdownSets.value.find(
        (x: any) => x.value === selectedValue
      )?.value;

      if (parentValue) {
        const dependentConfig = this.dropdownConfig.find(
          (x: any) => x.dependOn === dependentKey
        );
        const dependentOptions = dependentConfig?.data.filter(
          (option: any) => option.parentId === parentValue
        );

        if (dependentOptions && dependentOptions.length > 0) {
          const defaultValue = dependentOptions[0].id;
          const departmentDropdown = this.dropdownSets.controls.find(
            (control, i) => {
              const key = control.get('key')?.value;
              return key === dependentConfig.key;
            }
          );
          if (departmentDropdown) {
            departmentDropdown.get('value')?.setValue(defaultValue);
          }
        }
      }
    }
  }
}
