import {NgModule} from '@angular/core';

import {Routes, RouterModule} from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import(
      './pages/home/home.module'
    ).then(
      m => m.HomePageModule
    )
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {}
