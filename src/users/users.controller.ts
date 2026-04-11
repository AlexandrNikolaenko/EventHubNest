import { Controller, Get, Render } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller('profile')
export class UsersController {
  @Get()
  @Render('profile')
  profile() {
    return {
      extraHead: `<link rel="stylesheet" href="/styles/profile.css" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css">
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js"></script>`,
      pageModuleScripts: ['api.js', 'http-api.js', 'profile.js'],
    };
  }
}
