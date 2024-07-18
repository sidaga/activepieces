import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditableTextComponent } from './components/editable-text/editable-text.component';
import {
  MatTooltipDefaultOptions,
  MatTooltipModule,
} from '@angular/material/tooltip';
import { WarningBoxComponent } from './components/warning-box/warning-box.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { StateIconComponent } from './components/status-icon/state-icon.component';
import { LoadingIconComponent } from './components/loading-icon/loading-icon.component';
import { ApPaginatorComponent } from './components/pagination/ap-paginator.component';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import {
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatFormFieldModule,
} from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { IconButtonComponent } from './components/icon-button/icon-button.component';
import { HotspotComponent } from './components/hotspot/hotspot.component';
import { MatButtonModule } from '@angular/material/button';
import { ApButtonComponent } from './components/ap-button/ap-button.component';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { DialogTitleTemplateComponent } from './components/dialogs/dialog-title-template/dialog-title-template.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DefaultFalsePipe } from './pipe/default-false.pipe';
import { DefaultTruePipe } from './pipe/default-true.pipe';
import { CenterMatMenuDirective } from './directives/center-mat-menu.directive';
import { SidebarHeaderComponent } from './components/sidebar-header/sidebar-header.component';
import { JsonViewComponent } from './components/json-view/json-view.component';
import { JsonViewDialogComponent } from './components/json-view/json-view-dialog/json-view-dialog.component';
import { HorizontalSidebarSeparatorComponent } from './components/horizontal-sidebar-separator/horizontal-sidebar-separator.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TrackFocusDirective } from './directives/track-focus.directive';
import { ObjectToArrayPipe } from './pipe/object-to-array.pipe';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DeleteEntityDialogComponent } from './components/dialogs/delete-enity-dialog/delete-entity-dialog.component';
import { MatDividerModule } from '@angular/material/divider';
import { GenericSnackbarTemplateComponent } from './components/generic-snackbar-template/generic-snackbar-template.component';
import { MatIconModule } from '@angular/material/icon';
import { UserAvatarComponent } from './components/user-avatar/user-avatar.component';
import { TrackHoverDirective } from './directives/track-hover.directive';
import { UploadFileControlComponent } from './components/upload-file-control/upload-file-control.component';
import { DragDropDirective } from './directives/drag-drop.directive';
import { ElementDirective } from './directives/element-ref.directive';
import { CheckOverflowDirective } from './directives/check-overflow.directive';
import { MatTabsModule } from '@angular/material/tabs';
import { FileDroppedDirective } from './directives/file-dropped.directive';
import { NgxColorsModule } from 'ngx-colors';
import { PageTitleComponent } from './components/page-title/page-title.component';
import { PoweredByActivepiecesComponent } from './components/powered-by-activepieces/powered-by-activepieces.component';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ImgFallbackDirective } from './directives/image-fallback.directive';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS } from '@angular/material/button-toggle';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ArrayFormControlComponent } from './components/array-form-control/array-form-control.component';
import { UpgradeNoteComponent } from '././components/upgrade-note/upgrade-note.component';
import { CardDirective } from './directives/card.directive';
import { DropdownPropertySearchPipe } from './pipe/dropdown-search.pipe';
import { ImportFlowDialogComponent } from './components/dialogs/import-flow-dialog/import-flow-dialog.component';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { LetterIconComponent } from './components/letter-icon/letter-icon.component';
import { MatListModule } from '@angular/material/list';
import { MatPseudoCheckboxModule } from '@angular/material/core';
import { ControlDescriptionComponent } from './components/control-description/control-description.component';
import { MatChipsModule } from '@angular/material/chips';
import { ApChipsListComponent } from './components/ap-chips-list/ap-chips-list.component';
import { ApMarkdownComponent } from './components';
import { CommaSeparatedPipe } from './pipe/comma-separated.pipe';
import { MARKED_OPTIONS, MarkdownModule, MarkedRenderer } from 'ngx-markdown';
import { AbstractFormControlCasterPipe } from './pipe/abstract-form-control-caster.pipe';
import { VersionHistoryIndicatorComponent } from './components/ap-version-status-indicator/ap-version-history-indicator.component';
import { InsideBuilderDatePipe } from './pipe/inside-builder-date.pipe';
import { ConfirmActionDialogComponent } from './components/dialogs/confirm-action-dialog/confirm-action-dialog.component';
import { DurationFormatterPipe } from './pipe';
import { ContactSalesDialogComponent } from './components/dialogs/contact-sales-dialog/contact-sales-dialog.component';
import { ContactSalesComponent } from './components/contact-sales/contact-sales.component';
import { PortalModule } from '@angular/cdk/portal';

const exportedImports = [
  CommonModule,
  MatTooltipModule,
  AngularSvgIconModule,
  MatFormFieldModule,
  ReactiveFormsModule,
  MatSelectModule,
  MatInputModule,
  MatChipsModule,
  MatMenuModule,
  MatButtonModule,
  MatCardModule,
  MatTableModule,
  MatDialogModule,
  MatSidenavModule,
  MatProgressBarModule,
  MatButtonToggleModule,
  MatSlideToggleModule,
  DragDropModule,
  MatCheckboxModule,
  MatDividerModule,
  MatIconModule,
  MatTabsModule,
  NgxColorsModule,
  MatSliderModule,
  MatSnackBarModule,
  ScrollingModule,
  MonacoEditorModule,
  MatListModule,
  MatPseudoCheckboxModule,
  CheckOverflowDirective,
  ControlDescriptionComponent,
  AbstractFormControlCasterPipe,
  VersionHistoryIndicatorComponent,
  InsideBuilderDatePipe,
  DurationFormatterPipe,
  PortalModule,
];
const exportedDeclarations = [
  UploadFileControlComponent,
  ElementDirective,
  ApMarkdownComponent,
  EditableTextComponent,
  ApButtonComponent,
  WarningBoxComponent,
  StateIconComponent,
  LoadingIconComponent,
  ApPaginatorComponent,
  HotspotComponent,
  IconButtonComponent,
  ApButtonComponent,
  DialogTitleTemplateComponent,
  CommaSeparatedPipe,
  DefaultFalsePipe,
  DefaultTruePipe,
  CenterMatMenuDirective,
  SidebarHeaderComponent,
  JsonViewComponent,
  JsonViewDialogComponent,
  HorizontalSidebarSeparatorComponent,
  TrackFocusDirective,
  ObjectToArrayPipe,
  DeleteEntityDialogComponent,
  GenericSnackbarTemplateComponent,
  UserAvatarComponent,
  TrackHoverDirective,
  DragDropDirective,
  ApChipsListComponent,
  PageTitleComponent,
  PoweredByActivepiecesComponent,
  ImgFallbackDirective,
  ArrayFormControlComponent,
  UpgradeNoteComponent,
  CardDirective,
  ImportFlowDialogComponent,
  DropdownPropertySearchPipe,
  LetterIconComponent,
  ConfirmActionDialogComponent,
  ContactSalesDialogComponent,
  ContactSalesComponent,
];
export const materialTooltipDefaults: MatTooltipDefaultOptions = {
  showDelay: 0,
  hideDelay: 0,
  touchendHideDelay: 0,
};

export function markedOptionsFactory() {
  const renderer = new MarkedRenderer();
  const linkRenderer = renderer.link;

  renderer.link = (href, title, text) => {
    const html = linkRenderer.call(renderer, href, title, text);
    return html.replace(
      /^<a /,
      '<a role="link" tabindex="0" rel="noopener" target="_blank" rel="nofollow noopener noreferrer" '
    );
  };

  return {
    renderer,
    gfm: true,
    breaks: false,
    pedantic: false,
    smartLists: true,
    smartypants: false,
  };
}
@NgModule({
  imports: [
    ...exportedImports,
    NgJsonEditorModule,
    MarkdownModule.forRoot({
      markedOptions: {
        provide: MARKED_OPTIONS,
        useFactory: markedOptionsFactory,
      },
    }),
  ],
  providers: [
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 2500 } },
    {
      provide: MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS,
      useValue: {
        hideMultipleSelectionIndicator: true,
        hideSingleSelectionIndicator: true,
      },
    },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline' },
    },
  ],
  declarations: [...exportedDeclarations, FileDroppedDirective],
  exports: [...exportedImports, ...exportedDeclarations, MarkdownModule],
})
export class UiCommonModule {}
