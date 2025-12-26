import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-about',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss']
})
export class AboutComponent {
    teamMembers = [
        {
            role: 'Cloud & Frontend Engineer',
            name: 'Y. Kamouss',
            desc: 'Spécialiste Cloud et Angular créant des architectures web performantes et scalables.',
            image: 'https://ui-avatars.com/api/?name=Y+Kamouss&background=0D8ABC&color=fff'
        },
        {
            role: 'Backend Engineer',
            name: 'A. Yahya',
            desc: 'Spring Boot architect ensuring robust microservices.',
            image: 'https://ui-avatars.com/api/?name=A+Yahya&background=2ecc71&color=fff'
        },
        {
            role: 'Blockchain Engineer',
            name: 'U. Junaid',
            desc: 'Solidity expert developing secure Smart Contracts.',
            image: 'https://ui-avatars.com/api/?name=U+Junaid&background=9b59b6&color=fff'
        },
        {
            role: 'DevOps Engineer',
            name: 'S. Mohammed',
            desc: 'CI/CD & Kubernetes orchestration master.',
            image: 'https://ui-avatars.com/api/?name=S+Mohammed&background=e67e22&color=fff'
        }
    ];

    techStack = [
        { name: 'Ethereum', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/480px-Ethereum-icon-purple.svg.png' },
        { name: 'Angular', icon: 'https://angular.io/assets/images/logos/angular/angular.svg' },
        { name: 'Spring Boot', icon: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Spring_Framework_Logo_2018.svg' },
        { name: 'AWS', icon: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg' },
        { name: 'Python AI', icon: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg' }
    ];
}
